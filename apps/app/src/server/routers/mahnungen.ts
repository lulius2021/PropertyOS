/**
 * Mahnungen tRPC Router
 * Handles dunning process
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";
import {
  ersteMahnung,
  ermittleMahnvorschlaege,
} from "../services/mahnwesen.service";
import { generiereUndSpeichereMahnung } from "../services/document.service";

export const mahnungenRouter = router({
  /**
   * Liste aller Mahnungen
   */
  list: protectedProcedure
    .input(
      z
        .object({
          mietverhaeltnisId: z.string().optional(),
          status: z.enum(["OFFEN", "VERSENDET", "BEZAHLT", "STORNIERT"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const mahnungen = await ctx.db.mahnung.findMany({
        where: {
          tenantId: ctx.tenantId,
          mietverhaeltnisId: input?.mietverhaeltnisId,
          status: input?.status,
        },
        include: {
          dokumente: true,
        },
        orderBy: { mahnDatum: "desc" },
      });

      return mahnungen.map((m) => ({
        ...m,
        offenerBetrag: m.offenerBetrag.toString(),
        mahngebuehr: m.mahngebuehr.toString(),
        verzugszinsen: m.verzugszinsen.toString(),
      }));
    }),

  /**
   * Einzelne Mahnung abrufen
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const mahnung = await ctx.db.mahnung.findUnique({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          dokumente: true,
        },
      });

      if (!mahnung) {
        throw new Error("Mahnung nicht gefunden");
      }

      // Mietverhältnis mit Details laden
      const mietverhaeltnis = await ctx.db.mietverhaeltnis.findUnique({
        where: { id: mahnung.mietverhaeltnisId },
        include: {
          mieter: true,
          einheit: {
            include: {
              objekt: true,
            },
          },
        },
      });

      // Offene Sollstellungen laden
      const sollstellungen = await ctx.db.sollstellung.findMany({
        where: {
          tenantId: ctx.tenantId,
          mietverhaeltnisId: mahnung.mietverhaeltnisId,
          status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] },
        },
        orderBy: { faelligkeitsdatum: "asc" },
      });

      return {
        ...mahnung,
        mietverhaeltnis,
        sollstellungen,
      };
    }),

  /**
   * Mahnvorschläge ermitteln
   */
  vorschlaege: protectedProcedure.query(async ({ ctx }) => {
    const vorschlaege = await ermittleMahnvorschlaege(ctx.tenantId);
    return vorschlaege;
  }),

  /**
   * Mahnung erstellen
   */
  erstellen: protectedProcedure
    .input(
      z.object({
        mietverhaeltnisId: z.string(),
        mahnstufe: z.enum(["ERINNERUNG", "MAHNUNG_1", "MAHNUNG_2", "MAHNUNG_3"]),
        dokumentGenerieren: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Mahnung erstellen
      const mahnung = await ersteMahnung({
        mietverhaeltnisId: input.mietverhaeltnisId,
        mahnstufe: input.mahnstufe,
        tenantId: ctx.tenantId,
        userId: ctx.userId,
      });

      // Audit-Log
      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "MAHNUNG_ERSTELLT",
        entitaet: "Mahnung",
        entitaetId: mahnung.id,
        neuWert: mahnung,
      });

      // Dokument generieren
      let dokument = null;
      if (input.dokumentGenerieren) {
        try {
          const result = await generiereUndSpeichereMahnung(
            mahnung.id,
            ctx.tenantId
          );
          dokument = result.dokument;

          await logAudit({
            tenantId: ctx.tenantId,
            userId: ctx.userId,
            aktion: "MAHNUNGSDOKUMENT_GENERIERT",
            entitaet: "Dokument",
            entitaetId: result.dokument.id,
            neuWert: result.dokument,
          });
        } catch (error) {
          // Dokument-Generierung fehlgeschlagen, aber Mahnung wurde erstellt
          console.error("Dokument-Generierung fehlgeschlagen:", error);
        }
      }

      return { mahnung, dokument };
    }),

  /**
   * Dokument für Mahnung generieren
   */
  generiereRDokument: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await generiereUndSpeichereMahnung(
        input.id,
        ctx.tenantId
      );

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "MAHNUNGSDOKUMENT_GENERIERT",
        entitaet: "Dokument",
        entitaetId: result.dokument.id,
        neuWert: result.dokument,
      });

      return result.dokument;
    }),

  /**
   * Mahnung als versendet markieren
   */
  markiereVersendet: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mahnung = await ctx.db.mahnung.update({
        where: { id: input.id, tenantId: ctx.tenantId },
        data: { status: "VERSENDET" },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "MAHNUNG_VERSENDET",
        entitaet: "Mahnung",
        entitaetId: input.id,
      });

      return mahnung;
    }),

  /**
   * Mahnung stornieren
   */
  stornieren: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const mahnung = await ctx.db.mahnung.update({
        where: { id: input.id, tenantId: ctx.tenantId },
        data: { status: "STORNIERT" },
      });

      // Zugehörige Sollstellungen auch stornieren
      if (mahnung.mahngebuehrPostenId) {
        await ctx.db.sollstellung.update({
          where: { id: mahnung.mahngebuehrPostenId },
          data: { status: "STORNIERT" },
        });
      }

      if (mahnung.verzugszinsenPostenId) {
        await ctx.db.sollstellung.update({
          where: { id: mahnung.verzugszinsenPostenId },
          data: { status: "STORNIERT" },
        });
      }

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "MAHNUNG_STORNIERT",
        entitaet: "Mahnung",
        entitaetId: input.id,
      });

      return mahnung;
    }),

  /**
   * Statistiken für Dashboard
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [offen, versendet] = await Promise.all([
      ctx.db.mahnung.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "OFFEN",
        },
        _sum: { offenerBetrag: true },
        _count: true,
      }),
      ctx.db.mahnung.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "VERSENDET",
        },
        _sum: { offenerBetrag: true },
        _count: true,
      }),
    ]);

    return {
      offen: {
        anzahl: offen._count,
        summe: offen._sum.offenerBetrag?.toNumber() || 0,
      },
      versendet: {
        anzahl: versendet._count,
        summe: versendet._sum.offenerBetrag?.toNumber() || 0,
      },
    };
  }),
});
