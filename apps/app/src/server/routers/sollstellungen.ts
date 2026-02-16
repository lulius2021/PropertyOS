/**
 * Sollstellungen tRPC Router
 * Handles payment requests (Sollstellungen)
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";
import { erstelleMonatlicheWarmmiete } from "../services/warmmiete.service";

export const sollstellungenRouter = router({
  /**
   * Liste aller Sollstellungen (mit Filter)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          mietverhaeltnisId: z.string().optional(),
          status: z
            .enum(["OFFEN", "TEILWEISE_BEZAHLT", "BEZAHLT", "STORNIERT"])
            .optional(),
          typ: z
            .enum([
              "WARMMIETE",
              "KAUTION",
              "NEBENKOSTEN",
              "MAHNGEBUEHR",
              "VERZUGSZINSEN",
              "SONSTIGE",
            ])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const sollstellungen = await ctx.db.sollstellung.findMany({
        where: {
          tenantId: ctx.tenantId,
          mietverhaeltnisId: input?.mietverhaeltnisId,
          status: input?.status,
          typ: input?.typ,
        },
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
          zahlungZuordnungen: {
            include: {
              zahlung: true,
            },
          },
        },
        orderBy: { faelligkeitsdatum: "desc" },
      });

      return sollstellungen.map((s) => ({
        ...s,
        betragGesamt: s.betragGesamt.toString(),
        kaltmiete: s.kaltmiete?.toString() || null,
        bkVorauszahlung: s.bkVorauszahlung?.toString() || null,
        hkVorauszahlung: s.hkVorauszahlung?.toString() || null,
        gedecktGesamt: s.gedecktGesamt.toString(),
        gedecktKalt: s.gedecktKalt?.toString() || null,
        gedecktBK: s.gedecktBK?.toString() || null,
        gedecktHK: s.gedecktHK?.toString() || null,
      }));
    }),

  /**
   * Einzelne Sollstellung abrufen
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.sollstellung.findUnique({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
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
          zahlungZuordnungen: {
            include: {
              zahlung: true,
            },
          },
        },
      });
    }),

  /**
   * Manuelle Sollstellung erstellen
   */
  create: protectedProcedure
    .input(
      z.object({
        mietverhaeltnisId: z.string().optional(),
        typ: z.enum([
          "WARMMIETE",
          "KAUTION",
          "NEBENKOSTEN",
          "MAHNGEBUEHR",
          "VERZUGSZINSEN",
          "SONSTIGE",
        ]),
        titel: z.string().min(1),
        betragGesamt: z.number().positive(),
        faelligkeitsdatum: z.date(),
        kaltmiete: z.number().optional(),
        bkVorauszahlung: z.number().optional(),
        hkVorauszahlung: z.number().optional(),
        notiz: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sollstellung = await ctx.db.sollstellung.create({
        data: {
          tenantId: ctx.tenantId,
          mietverhaeltnisId: input.mietverhaeltnisId,
          typ: input.typ,
          titel: input.titel,
          betragGesamt: input.betragGesamt,
          kaltmiete: input.kaltmiete,
          bkVorauszahlung: input.bkVorauszahlung,
          hkVorauszahlung: input.hkVorauszahlung,
          faelligkeitsdatum: input.faelligkeitsdatum,
          notiz: input.notiz,
          status: "OFFEN",
        },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "SOLLSTELLUNG_ERSTELLT",
        entitaet: "Sollstellung",
        entitaetId: sollstellung.id,
        neuWert: sollstellung,
      });

      return sollstellung;
    }),

  /**
   * Warmmiete für einen Monat erstellen
   */
  erstelleWarmmiete: protectedProcedure
    .input(
      z.object({
        mietverhaeltnisId: z.string(),
        monat: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sollstellung = await erstelleMonatlicheWarmmiete({
        mietverhaeltnisId: input.mietverhaeltnisId,
        monat: input.monat,
        tenantId: ctx.tenantId,
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "WARMMIETE_ERSTELLT",
        entitaet: "Sollstellung",
        entitaetId: sollstellung.id,
        neuWert: sollstellung,
      });

      return sollstellung;
    }),

  /**
   * Sollstellung löschen/stornieren
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sollstellung = await ctx.db.sollstellung.findUnique({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { zahlungZuordnungen: true },
      });

      if (!sollstellung) {
        throw new Error("Sollstellung nicht gefunden");
      }

      if (sollstellung.zahlungZuordnungen.length > 0) {
        throw new Error(
          "Sollstellung kann nicht gelöscht werden, da bereits Zahlungen zugeordnet sind"
        );
      }

      await ctx.db.sollstellung.update({
        where: { id: input.id },
        data: { status: "STORNIERT" },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "SOLLSTELLUNG_STORNIERT",
        entitaet: "Sollstellung",
        entitaetId: input.id,
        altWert: sollstellung,
      });

      return true;
    }),

  /**
   * Statistiken für Dashboard
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [offen, teilweiseBezahlt, bezahlt] = await Promise.all([
      ctx.db.sollstellung.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "OFFEN",
        },
        _sum: { betragGesamt: true },
        _count: true,
      }),
      ctx.db.sollstellung.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "TEILWEISE_BEZAHLT",
        },
        _sum: { betragGesamt: true, gedecktGesamt: true },
        _count: true,
      }),
      ctx.db.sollstellung.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "BEZAHLT",
        },
        _sum: { betragGesamt: true },
        _count: true,
      }),
    ]);

    return {
      offen: {
        anzahl: offen._count,
        summe: offen._sum.betragGesamt?.toNumber() || 0,
      },
      teilweiseBezahlt: {
        anzahl: teilweiseBezahlt._count,
        summe: teilweiseBezahlt._sum.betragGesamt?.toNumber() || 0,
        gedeckt: teilweiseBezahlt._sum.gedecktGesamt?.toNumber() || 0,
      },
      bezahlt: {
        anzahl: bezahlt._count,
        summe: bezahlt._sum.betragGesamt?.toNumber() || 0,
      },
    };
  }),
});
