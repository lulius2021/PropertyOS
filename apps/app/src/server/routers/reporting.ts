import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const reportingRouter = router({
  /**
   * Dashboard KPIs
   */
  dashboardKPIs: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    // Objekte & Einheiten
    const objekteCount = await db.objekt.count({ where: { tenantId } });
    const einheitenCount = await db.einheit.count({ where: { tenantId } });
    const vermieteteEinheiten = await db.einheit.count({
      where: { tenantId, status: "VERMIETET" },
    });

    // Offene Rückstände (Sollstellungen OFFEN oder TEILWEISE_BEZAHLT)
    const offeneSollstellungen = await db.sollstellung.findMany({
      where: {
        tenantId,
        status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] },
        faelligkeitsdatum: { lte: new Date() },
      },
    });

    const rueckstaende = offeneSollstellungen.reduce((sum, s) => {
      const offen = new Decimal(s.betragGesamt.toString()).minus(
        s.gedecktGesamt.toString()
      );
      return sum.plus(offen);
    }, new Decimal(0));

    // Offene Tickets
    const offeneTickets = await db.ticket.count({
      where: {
        tenantId,
        status: { in: ["ERFASST", "IN_BEARBEITUNG"] },
      },
    });

    // Unklar-Zahlungen
    const unklareZahlungen = await db.zahlung.count({
      where: { tenantId, status: "UNKLAR" },
    });

    // Offene Mahnungen
    const offeneMahnungen = await db.mahnung.count({
      where: { tenantId, status: "OFFEN" },
    });

    // Offene Sollstellungen (Anzahl)
    const offeneSollstellungenCount = await db.sollstellung.count({
      where: { tenantId, status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] } },
    });

    return {
      objekte: objekteCount,
      einheiten: {
        gesamt: einheitenCount,
        vermietet: vermieteteEinheiten,
        frei: einheitenCount - vermieteteEinheiten,
      },
      rueckstaende: rueckstaende.toFixed(2),
      offeneTickets,
      unklareZahlungen,
      offeneMahnungen,
      offeneSollstellungen: offeneSollstellungenCount,
    };
  }),

  /**
   * Soll/Ist Übersicht für Zeitraum
   */
  sollIstUebersicht: protectedProcedure
    .input(
      z.object({
        vonDatum: z.date(),
        bisDatum: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;

      // Sollstellungen im Zeitraum
      const sollstellungen = await db.sollstellung.findMany({
        where: {
          tenantId,
          faelligkeitsdatum: {
            gte: input.vonDatum,
            lte: input.bisDatum,
          },
        },
      });

      const sollGesamt = sollstellungen.reduce(
        (sum, s) => sum.plus(s.betragGesamt.toString()),
        new Decimal(0)
      );
      const istGesamt = sollstellungen.reduce(
        (sum, s) => sum.plus(s.gedecktGesamt.toString()),
        new Decimal(0)
      );

      return {
        soll: sollGesamt.toFixed(2),
        ist: istGesamt.toFixed(2),
        differenz: sollGesamt.minus(istGesamt).toFixed(2),
        quote: sollGesamt.greaterThan(0)
          ? istGesamt.dividedBy(sollGesamt).times(100).toFixed(2)
          : "0.00",
      };
    }),

  /**
   * Monatsübersicht Soll/Ist (letzte 12 Monate)
   */
  monatsuebersicht: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const results = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monat = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const naechsterMonat = new Date(
        monat.getFullYear(),
        monat.getMonth() + 1,
        1
      );

      const sollstellungen = await db.sollstellung.findMany({
        where: {
          tenantId,
          faelligkeitsdatum: {
            gte: monat,
            lt: naechsterMonat,
          },
        },
      });

      const soll = sollstellungen.reduce(
        (sum, s) => sum.plus(s.betragGesamt.toString()),
        new Decimal(0)
      );
      const ist = sollstellungen.reduce(
        (sum, s) => sum.plus(s.gedecktGesamt.toString()),
        new Decimal(0)
      );

      results.push({
        monat: monat.toISOString().substring(0, 7), // YYYY-MM
        soll: parseFloat(soll.toFixed(2)),
        ist: parseFloat(ist.toFixed(2)),
      });
    }

    return results;
  }),

  /**
   * Statusquoten (nach Typ)
   */
  statusquoten: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const einheitenByStatus = await db.einheit.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
    });

    const ticketsByStatus = await db.ticket.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: true,
    });

    return {
      einheiten: einheitenByStatus.map((item) => ({
        status: item.status,
        anzahl: item._count,
      })),
      tickets: ticketsByStatus.map((item) => ({
        status: item.status,
        anzahl: item._count,
      })),
    };
  }),

  /**
   * Portfolio-Export (CSV/Excel vorbereitet)
   */
  portfolioExport: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const objekte = await db.objekt.findMany({
      where: { tenantId },
      include: {
        einheiten: {
          include: {
            mietverhaeltnisse: {
              where: { auszugsdatum: null }, // Nur aktive Mietverhältnisse
              include: {
                mieter: true,
              },
            },
          },
        },
      },
    });

    const exportData = objekte.flatMap((obj) =>
      obj.einheiten.map((einheit) => ({
        objektBezeichnung: obj.bezeichnung,
        objektStrasse: obj.strasse,
        objektPlz: obj.plz,
        objektOrt: obj.ort,
        einheitNr: einheit.einheitNr,
        einheitTyp: einheit.typ,
        flaeche: einheit.flaeche.toString(),
        zimmer: einheit.zimmer || 0,
        status: einheit.status,
        kaltmiete:
          einheit.mietverhaeltnisse[0]?.kaltmiete.toString() || "0.00",
        mieterName:
          einheit.mietverhaeltnisse[0]?.mieter.nachname || "Frei",
      }))
    );

    return exportData;
  }),
});
