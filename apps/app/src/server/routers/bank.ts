/**
 * Bank tRPC Router
 * Handles payment imports and allocations
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";
import {
  ordneZahlungZu,
  hebeZuordnungAuf,
} from "../services/deckung.service";
import {
  autoMatchZahlung,
  autoMatchAlleUnklareZahlungen,
} from "../services/bank-matching.service";
import { Decimal } from "@prisma/client/runtime/library";

export const bankRouter = router({
  /**
   * Liste aller Zahlungen (mit Filter)
   */
  listZahlungen: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              "UNKLAR",
              "ZUGEORDNET",
              "TEILWEISE_ZUGEORDNET",
              "IGNORIERT",
              "SPLITTET",
            ])
            .optional(),
          datumVon: z.date().optional(),
          datumBis: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const zahlungen = await ctx.db.zahlung.findMany({
        where: {
          tenantId: ctx.tenantId,
          status: input?.status,
          datum: {
            gte: input?.datumVon,
            lte: input?.datumBis,
          },
        },
        include: {
          zuordnungen: {
            include: {
              sollstellung: {
                include: {
                  mietverhaeltnis: {
                    include: {
                      mieter: true,
                      einheit: {
                        include: {
                          objekt: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { datum: "desc" },
      });

      return zahlungen.map((z) => ({
        ...z,
        betrag: z.betrag.toString(),
        zuordnungen: z.zuordnungen.map((zu) => ({
          ...zu,
          betrag: zu.betrag.toString(),
          deckungKalt: zu.deckungKalt?.toString() || null,
          deckungBK: zu.deckungBK?.toString() || null,
          deckungHK: zu.deckungHK?.toString() || null,
        })),
      }));
    }),

  /**
   * CSV-Import von Zahlungen
   */
  importCSV: protectedProcedure
    .input(
      z.object({
        zahlungen: z.array(
          z.object({
            datum: z.date(),
            betrag: z.number(),
            verwendungszweck: z.string(),
            iban: z.string().optional(),
          })
        ),
        autoMatch: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const importierteZahlungen = [];

      for (const z of input.zahlungen) {
        // Prüfen ob Zahlung bereits existiert (Duplikatsprüfung)
        const existierend = await ctx.db.zahlung.findFirst({
          where: {
            tenantId: ctx.tenantId,
            datum: z.datum,
            betrag: z.betrag,
            verwendungszweck: z.verwendungszweck,
          },
        });

        if (existierend) {
          continue; // Duplikat überspringen
        }

        const zahlung = await ctx.db.zahlung.create({
          data: {
            tenantId: ctx.tenantId,
            datum: z.datum,
            betrag: z.betrag,
            verwendungszweck: z.verwendungszweck,
            iban: z.iban,
            status: "UNKLAR",
          },
        });

        importierteZahlungen.push(zahlung);

        await logAudit({
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          aktion: "ZAHLUNG_IMPORTIERT",
          entitaet: "Zahlung",
          entitaetId: zahlung.id,
          neuWert: zahlung,
        });
      }

      // Auto-Matching
      let matchResults = null;
      if (input.autoMatch && importierteZahlungen.length > 0) {
        const results = [];
        for (const zahlung of importierteZahlungen) {
          const result = await autoMatchZahlung(zahlung.id, ctx.tenantId);
          results.push(result);
        }
        matchResults = {
          gesamt: results.length,
          erfolgreich: results.filter((r) => r.matched).length,
          fehlgeschlagen: results.filter((r) => !r.matched).length,
        };
      }

      return {
        importiert: importierteZahlungen.length,
        zahlungen: importierteZahlungen,
        matchResults,
      };
    }),

  /**
   * Manuelle Zuordnung einer Zahlung zu einer Sollstellung
   */
  zuordnen: protectedProcedure
    .input(
      z.object({
        zahlungId: z.string(),
        sollstellungId: z.string(),
        betrag: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const zuordnung = await ordneZahlungZu({
        zahlungId: input.zahlungId,
        sollstellungId: input.sollstellungId,
        betrag: new Decimal(input.betrag),
        tenantId: ctx.tenantId,
        userId: ctx.userId,
      });

      return zuordnung;
    }),

  /**
   * Zahlung aufteilen (Split)
   */
  splitten: protectedProcedure
    .input(
      z.object({
        zahlungId: z.string(),
        zuordnungen: z.array(
          z.object({
            sollstellungId: z.string(),
            betrag: z.number().positive(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const zahlung = await ctx.db.zahlung.findUnique({
        where: { id: input.zahlungId, tenantId: ctx.tenantId },
      });

      if (!zahlung) {
        throw new Error("Zahlung nicht gefunden");
      }

      // Beträge summieren und prüfen
      const summe = input.zuordnungen.reduce(
        (sum, z) => sum.plus(z.betrag),
        new Decimal(0)
      );

      if (!summe.equals(zahlung.betrag.toString())) {
        throw new Error(
          `Summe der Teilbeträge (${summe.toFixed(2)} EUR) stimmt nicht mit Zahlungsbetrag (${zahlung.betrag.toFixed(2)} EUR) überein`
        );
      }

      // Alle Zuordnungen erstellen
      const erstellteZuordnungen = [];
      for (const z of input.zuordnungen) {
        const zuordnung = await ordneZahlungZu({
          zahlungId: input.zahlungId,
          sollstellungId: z.sollstellungId,
          betrag: new Decimal(z.betrag),
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
        erstellteZuordnungen.push(zuordnung);
      }

      // Zahlung als "SPLITTET" markieren
      await ctx.db.zahlung.update({
        where: { id: input.zahlungId },
        data: { status: "SPLITTET" },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "ZAHLUNG_GESPLITTET",
        entitaet: "Zahlung",
        entitaetId: input.zahlungId,
        neuWert: { zuordnungen: erstellteZuordnungen.length },
      });

      return erstellteZuordnungen;
    }),

  /**
   * Zahlung ignorieren
   */
  ignorieren: protectedProcedure
    .input(z.object({ zahlungId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.zahlung.update({
        where: { id: input.zahlungId, tenantId: ctx.tenantId },
        data: { status: "IGNORIERT" },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "ZAHLUNG_IGNORIERT",
        entitaet: "Zahlung",
        entitaetId: input.zahlungId,
      });

      return true;
    }),

  /**
   * Zuordnung aufheben (Revert)
   */
  zuordnungAufheben: protectedProcedure
    .input(z.object({ zuordnungId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await hebeZuordnungAuf(input.zuordnungId, ctx.tenantId, ctx.userId);
      return true;
    }),

  /**
   * Auto-Matching für alle unklaren Zahlungen
   */
  autoMatchAlle: protectedProcedure.mutation(async ({ ctx }) => {
    const results = await autoMatchAlleUnklareZahlungen(ctx.tenantId);

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "AUTO_MATCH_AUSGEFUEHRT",
        entitaet: "Zahlung",
        entitaetId: "batch",
        neuWert: results,
      });

      return results;
    }),

  /**
   * Bank-Import-Profile verwalten
   */
  listProfiles: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.bankImportProfile.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { profilName: "asc" },
    });
  }),

  createProfile: protectedProcedure
    .input(
      z.object({
        profilName: z.string().min(1),
        csvSeparator: z.string().default(";"),
        datumSpalte: z.number().int().nonnegative(),
        betragSpalte: z.number().int().nonnegative(),
        verwendungszweckSpalte: z.number().int().nonnegative(),
        ibanSpalte: z.number().int().nonnegative().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.bankImportProfile.create({
        data: {
          tenantId: ctx.tenantId,
          profilName: input.profilName,
          csvSeparator: input.csvSeparator,
          datumSpalte: input.datumSpalte,
          betragSpalte: input.betragSpalte,
          verwendungszweckSpalte: input.verwendungszweckSpalte,
          ibanSpalte: input.ibanSpalte,
        },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "BANK_PROFIL_ERSTELLT",
        entitaet: "BankImportProfile",
        entitaetId: profile.id,
        neuWert: profile,
      });

      return profile;
    }),

  deleteProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.bankImportProfile.delete({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "BANK_PROFIL_GELOESCHT",
        entitaet: "BankImportProfile",
        entitaetId: input.id,
      });

      return true;
    }),
});
