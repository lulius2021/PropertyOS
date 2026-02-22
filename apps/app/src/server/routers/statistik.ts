import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { Decimal } from "@prisma/client/runtime/library";
import {
  berechneTilgungsplan,
  berechneRestschuld,
} from "../services/tilgungsplan.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decimal -> number, rounded to 2 decimal places */
function d2n(val: Decimal | null | undefined): number {
  if (!val) return 0;
  return parseFloat(val.toFixed(2));
}

/** Safe percentage: numerator / denominator * 100, returns 0 on division by zero */
function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return parseFloat(((numerator / denominator) * 100).toFixed(2));
}

/** Difference in days between two Dates */
function diffDays(a: Date, b: Date): number {
  return Math.abs(
    (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** Difference in months (fractional) */
function diffMonths(a: Date, b: Date): number {
  return diffDays(a, b) / 30.44;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const statistikRouter = router({
  // =========================================================================
  // 1) VERMIETUNG
  // =========================================================================
  vermietung: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;
    const now = new Date();
    const currentYear = now.getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    // Parallel DB calls
    const [einheitenAll, mvFluktuationsCount, leereEinheiten] =
      await Promise.all([
        // All einheiten with counts
        ctx.db.einheit.findMany({
          where: { tenantId },
          select: { id: true, status: true, flaeche: true },
        }),
        // Mietverhaeltnisse with auszugsdatum in current year (fluktuation)
        ctx.db.mietverhaeltnis.count({
          where: {
            tenantId,
            auszugsdatum: { gte: yearStart, lte: yearEnd },
          },
        }),
        // Leere Einheiten with their most recent Mietverhaeltnis
        ctx.db.einheit.findMany({
          where: {
            tenantId,
            status: { not: "VERMIETET" },
          },
          select: {
            id: true,
            flaeche: true,
            mietverhaeltnisse: {
              orderBy: { auszugsdatum: "desc" },
              take: 1,
              select: {
                auszugsdatum: true,
                kaltmiete: true,
              },
            },
          },
        }),
      ]);

    const einheitenGesamt = einheitenAll.length;
    const einheitenVermietet = einheitenAll.filter(
      (e) => e.status === "VERMIETET"
    ).length;
    const einheitenLeer = einheitenGesamt - einheitenVermietet;
    const belegungsquote = pct(einheitenVermietet, einheitenGesamt);
    const leerstandsquote = pct(einheitenLeer, einheitenGesamt);
    const fluktuationsquote = pct(mvFluktuationsCount, einheitenGesamt);

    // Calculate avgLeerstandsdauerTage and ertragsverlustLeerstand
    let totalLeerstandTage = 0;
    let leerstandMitDatum = 0;
    let ertragsverlustLeerstand = 0;

    for (const einheit of leereEinheiten) {
      const letztesMV = einheit.mietverhaeltnisse[0];
      if (letztesMV?.auszugsdatum) {
        const tage = diffDays(now, letztesMV.auszugsdatum);
        totalLeerstandTage += tage;
        leerstandMitDatum++;

        // Ertragsverlust: kaltmiete * leerstandsmonate
        const monate = diffMonths(now, letztesMV.auszugsdatum);
        const kaltmiete = d2n(letztesMV.kaltmiete);
        ertragsverlustLeerstand += kaltmiete * monate;
      }
    }

    const avgLeerstandsdauerTage =
      leerstandMitDatum > 0
        ? parseFloat((totalLeerstandTage / leerstandMitDatum).toFixed(1))
        : 0;

    return {
      einheitenGesamt,
      einheitenVermietet,
      einheitenLeer,
      belegungsquote,
      leerstandsquote,
      avgLeerstandsdauerTage,
      fluktuationsquote,
      ertragsverlustLeerstand: parseFloat(ertragsverlustLeerstand.toFixed(2)),
    };
  }),

  // =========================================================================
  // 2) SOLL / IST
  // =========================================================================
  sollIst: protectedProcedure
    .input(
      z
        .object({
          jahr: z.number().optional(),
          monat: z.number().min(1).max(12).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const now = new Date();
      const jahr = input?.jahr ?? now.getFullYear();

      // Date range for the period
      let periodStart: Date;
      let periodEnd: Date;
      if (input?.monat) {
        periodStart = new Date(jahr, input.monat - 1, 1);
        periodEnd = new Date(jahr, input.monat, 0, 23, 59, 59);
      } else {
        periodStart = new Date(jahr, 0, 1);
        periodEnd = new Date(jahr, 11, 31, 23, 59, 59);
      }

      const [sollstellungen, zuordnungen, overdueSollstellungen] =
        await Promise.all([
          // All sollstellungen in period (non-storniert)
          ctx.db.sollstellung.findMany({
            where: {
              tenantId,
              faelligkeitsdatum: { gte: periodStart, lte: periodEnd },
              status: { not: "STORNIERT" },
            },
            select: {
              id: true,
              betragGesamt: true,
              gedecktGesamt: true,
              status: true,
              mietverhaeltnisId: true,
              faelligkeitsdatum: true,
            },
          }),
          // All zuordnungen in period (for avg payment delay)
          ctx.db.zahlungZuordnung.findMany({
            where: {
              tenantId,
              sollstellung: {
                tenantId,
                faelligkeitsdatum: { gte: periodStart, lte: periodEnd },
                status: { not: "STORNIERT" },
              },
            },
            select: {
              zugeordnetAm: true,
              sollstellung: {
                select: { faelligkeitsdatum: true },
              },
            },
          }),
          // Overdue sollstellungen (fällig <= now, OFFEN or TEILWEISE_BEZAHLT)
          ctx.db.sollstellung.findMany({
            where: {
              tenantId,
              faelligkeitsdatum: { lte: now },
              status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] },
            },
            select: {
              betragGesamt: true,
              gedecktGesamt: true,
              mietverhaeltnisId: true,
              faelligkeitsdatum: true,
            },
          }),
        ]);

      // Soll & Ist sums
      let sollSumme = new Decimal(0);
      let istSumme = new Decimal(0);
      for (const s of sollstellungen) {
        sollSumme = sollSumme.plus(s.betragGesamt);
        istSumme = istSumme.plus(s.gedecktGesamt);
      }

      const einzugsquote = pct(d2n(istSumme), d2n(sollSumme));

      // Rueckstaende
      let rueckstaende = new Decimal(0);
      const mieterMitRueckstand = new Set<string>();
      for (const s of overdueSollstellungen) {
        const offen = s.betragGesamt.minus(s.gedecktGesamt);
        if (offen.greaterThan(0)) {
          rueckstaende = rueckstaende.plus(offen);
          if (s.mietverhaeltnisId) {
            mieterMitRueckstand.add(s.mietverhaeltnisId);
          }
        }
      }

      // Avg Zahlungsverzug
      let totalVerzugTage = 0;
      let verzugCount = 0;
      for (const z of zuordnungen) {
        const faellig = z.sollstellung.faelligkeitsdatum;
        const zugeordnet = z.zugeordnetAm;
        if (zugeordnet && faellig) {
          const tage = diffDays(zugeordnet, faellig);
          // Only count if payment was after due date
          if (zugeordnet.getTime() > faellig.getTime()) {
            totalVerzugTage += tage;
          }
          verzugCount++;
        }
      }
      const avgZahlungsverzugTage =
        verzugCount > 0
          ? parseFloat((totalVerzugTage / verzugCount).toFixed(1))
          : 0;

      // Aging buckets
      let bis30 = 0;
      let bis60 = 0;
      let bis90 = 0;
      let ueber90 = 0;
      for (const s of overdueSollstellungen) {
        const offen = d2n(s.betragGesamt.minus(s.gedecktGesamt));
        if (offen <= 0) continue;
        const tageUeberfaellig = diffDays(now, s.faelligkeitsdatum);
        if (tageUeberfaellig <= 30) bis30 += offen;
        else if (tageUeberfaellig <= 60) bis60 += offen;
        else if (tageUeberfaellig <= 90) bis90 += offen;
        else ueber90 += offen;
      }

      return {
        sollSumme: d2n(sollSumme),
        istSumme: d2n(istSumme),
        einzugsquote,
        rueckstaende: d2n(rueckstaende),
        rueckstaendeMieterAnzahl: mieterMitRueckstand.size,
        avgZahlungsverzugTage,
        aging: {
          bis30: parseFloat(bis30.toFixed(2)),
          bis60: parseFloat(bis60.toFixed(2)),
          bis90: parseFloat(bis90.toFixed(2)),
          ueber90: parseFloat(ueber90.toFixed(2)),
        },
      };
    }),

  // =========================================================================
  // 3) CASHFLOW
  // =========================================================================
  cashflow: protectedProcedure
    .input(
      z
        .object({
          jahr: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const now = new Date();
      const jahr = input?.jahr ?? now.getFullYear();
      const yearStart = new Date(jahr, 0, 1);
      const yearEnd = new Date(jahr, 11, 31, 23, 59, 59);

      const [zahlungenAgg, kostenAgg, kredite] = await Promise.all([
        // Einnahmen: sum of zahlungen in year with relevant statuses
        ctx.db.zahlung.aggregate({
          where: {
            tenantId,
            datum: { gte: yearStart, lte: yearEnd },
            status: { in: ["ZUGEORDNET", "TEILWEISE_ZUGEORDNET", "SPLITTET"] },
          },
          _sum: { betrag: true },
        }),
        // Ausgaben: sum of kosten in year (OPEX)
        ctx.db.kosten.aggregate({
          where: {
            tenantId,
            jahr,
          },
          _sum: { betragBrutto: true },
        }),
        // Kredite with sondertilgungen for debt service calculation
        ctx.db.kredit.findMany({
          where: { tenantId },
          include: { sondertilgungen: true },
        }),
      ]);

      const einnahmen = d2n(zahlungenAgg._sum.betrag);
      const ausgabenOpex = d2n(kostenAgg._sum.betragBrutto);
      const operativerCashflow = parseFloat(
        (einnahmen - ausgabenOpex).toFixed(2)
      );

      // Debt service calculation
      let debtServiceZins = 0;
      let debtServiceTilgung = 0;

      for (const kredit of kredite) {
        const kStart = kredit.startdatum;
        const rate = parseFloat(kredit.rate.toString());
        const zinssatz = parseFloat(kredit.zinssatz.toString());
        const ursprungsbetrag = parseFloat(
          kredit.ursprungsbetrag.toString()
        );

        // Calculate months this kredit is active within the year
        const kreditStart = kStart > yearStart ? kStart : yearStart;
        const laufzeitEndeDate = new Date(kStart);
        laufzeitEndeDate.setMonth(
          laufzeitEndeDate.getMonth() + kredit.laufzeitMonate
        );
        const kreditEnd =
          laufzeitEndeDate < yearEnd ? laufzeitEndeDate : yearEnd;

        if (kreditStart > yearEnd || kreditEnd < yearStart) continue; // not active in this year

        const monthsActive = Math.max(
          0,
          diffMonths(kreditEnd, kreditStart)
        );
        if (monthsActive === 0) continue;

        const totalDebtService = rate * monthsActive;

        // Estimate restschuld at start of year via amortization
        const plan = berechneTilgungsplan({
          ursprungsbetrag,
          zinssatz,
          rate,
          startdatum: kStart,
          laufzeitMonate: kredit.laufzeitMonate,
          sondertilgungen: kredit.sondertilgungen.map((st) => ({
            datum: st.datum,
            betrag: parseFloat(st.betrag.toString()),
          })),
        });

        const restschuldAtYearStart = berechneRestschuld(plan, yearStart);

        // Approximate interest for the year: restschuld * zinssatz / 12 * monthsActive
        const interestEstimate =
          (restschuldAtYearStart * zinssatz * monthsActive) / 12;

        debtServiceZins += interestEstimate;
        debtServiceTilgung += totalDebtService - interestEstimate;
      }

      // Ensure tilgung doesn't go negative from estimation
      if (debtServiceTilgung < 0) {
        debtServiceTilgung = 0;
      }

      const debtServiceGesamt = parseFloat(
        (debtServiceZins + debtServiceTilgung).toFixed(2)
      );

      return {
        einnahmen,
        ausgabenOpex,
        operativerCashflow,
        debtServiceZins: parseFloat(debtServiceZins.toFixed(2)),
        debtServiceTilgung: parseFloat(debtServiceTilgung.toFixed(2)),
        debtServiceGesamt,
        cashflowNachDebt: parseFloat(
          (operativerCashflow - debtServiceGesamt).toFixed(2)
        ),
      };
    }),

  // =========================================================================
  // 4) FINANZIERUNG
  // =========================================================================
  finanzierung: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [kredite, einnahmenAgg, kostenAgg] = await Promise.all([
      ctx.db.kredit.findMany({
        where: { tenantId },
        include: { sondertilgungen: true },
      }),
      // Last 12 months einnahmen for DSCR
      ctx.db.zahlung.aggregate({
        where: {
          tenantId,
          datum: { gte: twelveMonthsAgo, lte: now },
          status: {
            in: ["ZUGEORDNET", "TEILWEISE_ZUGEORDNET", "SPLITTET"],
          },
        },
        _sum: { betrag: true },
      }),
      // Last 12 months kosten
      ctx.db.kosten.aggregate({
        where: {
          tenantId,
          datum: { gte: twelveMonthsAgo, lte: now },
        },
        _sum: { betragBrutto: true },
      }),
    ]);

    let restschuldGesamt = 0;
    let monatlicheRateGesamt = 0;

    const krediteDetails = kredite.map((kredit) => {
      const rate = parseFloat(kredit.rate.toString());
      const zinssatz = parseFloat(kredit.zinssatz.toString());
      const ursprungsbetrag = parseFloat(
        kredit.ursprungsbetrag.toString()
      );

      // Calculate Restschuld via amortization
      const plan = berechneTilgungsplan({
        ursprungsbetrag,
        zinssatz,
        rate,
        startdatum: kredit.startdatum,
        laufzeitMonate: kredit.laufzeitMonate,
        sondertilgungen: kredit.sondertilgungen.map((st) => ({
          datum: st.datum,
          betrag: parseFloat(st.betrag.toString()),
        })),
      });
      const restschuld = berechneRestschuld(plan, now);

      restschuldGesamt += restschuld;
      monatlicheRateGesamt += rate;

      return {
        bezeichnung: kredit.bezeichnung,
        bank: kredit.bank,
        restschuld: parseFloat(restschuld.toFixed(2)),
        rate: parseFloat(rate.toFixed(2)),
        zinssatz: parseFloat((zinssatz * 100).toFixed(2)), // as percentage
      };
    });

    const jahresDebtService = parseFloat(
      (monatlicheRateGesamt * 12).toFixed(2)
    );

    // NOI = einnahmen - kosten (last 12 months)
    const einnahmen12m = d2n(einnahmenAgg._sum.betrag);
    const kosten12m = d2n(kostenAgg._sum.betragBrutto);
    const noi = einnahmen12m - kosten12m;
    const dscr =
      jahresDebtService > 0
        ? parseFloat((noi / jahresDebtService).toFixed(2))
        : 0;

    return {
      krediteAnzahl: kredite.length,
      ursprungsbetragGesamt: parseFloat(
        kredite
          .reduce(
            (sum, k) => sum.plus(k.ursprungsbetrag),
            new Decimal(0)
          )
          .toFixed(2)
      ),
      restschuldGesamt: parseFloat(restschuldGesamt.toFixed(2)),
      monatlicheRateGesamt: parseFloat(monatlicheRateGesamt.toFixed(2)),
      jahresDebtService,
      dscr,
      krediteDetails,
    };
  }),

  // =========================================================================
  // 5) KOSTENANALYSE
  // =========================================================================
  kostenAnalyse: protectedProcedure
    .input(
      z
        .object({
          jahr: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();

      const [kostenAll, objekteFlaechen, kostenGrouped] = await Promise.all([
        // Aggregates for BK/HK/sonstige
        ctx.db.kosten.findMany({
          where: { tenantId, jahr },
          select: {
            betragBrutto: true,
            bkRelevant: true,
            hkRelevant: true,
            kategorie: true,
          },
        }),
        // Total floor area from Objekte
        ctx.db.objekt.aggregate({
          where: { tenantId },
          _sum: { gesamtflaeche: true, wohnflaeche: true },
        }),
        // Group by kategorie
        ctx.db.kosten.groupBy({
          by: ["kategorie"],
          where: { tenantId, jahr },
          _sum: { betragBrutto: true },
          orderBy: { _sum: { betragBrutto: "desc" } },
        }),
      ]);

      let kostenGesamt = 0;
      let bkRelevant = 0;
      let hkRelevant = 0;
      let sonstige = 0;

      for (const k of kostenAll) {
        const betrag = d2n(k.betragBrutto);
        kostenGesamt += betrag;
        if (k.bkRelevant) bkRelevant += betrag;
        if (k.hkRelevant) hkRelevant += betrag;
        if (!k.bkRelevant && !k.hkRelevant) sonstige += betrag;
      }

      // Floor area: prefer gesamtflaeche, fall back to wohnflaeche
      const gesamtFlaeche = d2n(
        objekteFlaechen._sum.gesamtflaeche ??
          objekteFlaechen._sum.wohnflaeche
      );

      const kostenProQm =
        gesamtFlaeche > 0
          ? parseFloat((kostenGesamt / gesamtFlaeche).toFixed(2))
          : 0;

      const nachKategorie = kostenGrouped.map((g) => ({
        kategorie: g.kategorie,
        summe: d2n(g._sum.betragBrutto),
      }));

      return {
        kostenGesamt: parseFloat(kostenGesamt.toFixed(2)),
        bkRelevant: parseFloat(bkRelevant.toFixed(2)),
        hkRelevant: parseFloat(hkRelevant.toFixed(2)),
        sonstige: parseFloat(sonstige.toFixed(2)),
        gesamtFlaeche,
        kostenProQm,
        nachKategorie,
      };
    }),

  // =========================================================================
  // 6) TICKETANALYSE
  // =========================================================================
  ticketAnalyse: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const [
      gesamt,
      offenErfasst,
      offenInBearbeitung,
      abgeschlossen,
      niedrig,
      mittel,
      hoch,
      kritisch,
      abgeschlosseneTickets,
      kategorien,
    ] = await Promise.all([
      ctx.db.ticket.count({ where: { tenantId } }),
      ctx.db.ticket.count({
        where: { tenantId, status: "ERFASST" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, status: "IN_BEARBEITUNG" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, status: "ABGESCHLOSSEN" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, prioritaet: "NIEDRIG" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, prioritaet: "MITTEL" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, prioritaet: "HOCH" },
      }),
      ctx.db.ticket.count({
        where: { tenantId, prioritaet: "KRITISCH" },
      }),
      // Fetch abgeschlossene tickets for avg processing time
      ctx.db.ticket.findMany({
        where: { tenantId, status: "ABGESCHLOSSEN" },
        select: { createdAt: true, updatedAt: true },
      }),
      // Group by kategorie
      ctx.db.ticket.groupBy({
        by: ["kategorie"],
        where: { tenantId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    // Avg Bearbeitungstage
    let totalBearbeitungsTage = 0;
    for (const t of abgeschlosseneTickets) {
      totalBearbeitungsTage += diffDays(t.updatedAt, t.createdAt);
    }
    const avgBearbeitungsTage =
      abgeschlosseneTickets.length > 0
        ? parseFloat(
            (totalBearbeitungsTage / abgeschlosseneTickets.length).toFixed(1)
          )
        : 0;

    const topKategorien = kategorien.map((k) => ({
      kategorie: k.kategorie,
      anzahl: k._count.id,
    }));

    return {
      gesamt,
      offen: offenErfasst + offenInBearbeitung,
      abgeschlossen,
      nachPrioritaet: { niedrig, mittel, hoch, kritisch },
      avgBearbeitungsTage,
      topKategorien,
    };
  }),

  // =========================================================================
  // 7) ZAEHLERANALYSE
  // =========================================================================
  zaehlerAnalyse: protectedProcedure
    .input(
      z
        .object({
          jahr: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();
      const yearStart = new Date(jahr, 0, 1);
      const yearEnd = new Date(jahr, 11, 31, 23, 59, 59);

      const [zaehlerAll, zaehlerMitAblesungIds, nachTypRaw] =
        await Promise.all([
          // Total zaehler count
          ctx.db.zaehler.count({ where: { tenantId } }),
          // Zaehler IDs that have at least one ablesung in the year
          ctx.db.zaehlerstand.findMany({
            where: {
              tenantId,
              datum: { gte: yearStart, lte: yearEnd },
            },
            select: { zaehlerId: true },
            distinct: ["zaehlerId"],
          }),
          // Group zaehler by typ with ablesung counts
          ctx.db.zaehler.findMany({
            where: { tenantId },
            select: {
              typ: true,
              _count: {
                select: {
                  ablesungen: {
                    where: {
                      datum: { gte: yearStart, lte: yearEnd },
                    },
                  },
                },
              },
            },
          }),
        ]);

      const zaehlerGesamt = zaehlerAll;
      const zaehlerMitAblesung = zaehlerMitAblesungIds.length;
      const vollstaendigkeitsquote = pct(zaehlerMitAblesung, zaehlerGesamt);

      // Aggregate by typ
      const typMap = new Map<
        string,
        { anzahl: number; ablesungen: number }
      >();
      for (const z of nachTypRaw) {
        const entry = typMap.get(z.typ) ?? { anzahl: 0, ablesungen: 0 };
        entry.anzahl++;
        entry.ablesungen += z._count.ablesungen;
        typMap.set(z.typ, entry);
      }

      const nachTyp = Array.from(typMap.entries()).map(([typ, data]) => ({
        typ,
        anzahl: data.anzahl,
        ablesungen: data.ablesungen,
      }));

      return {
        zaehlerGesamt,
        zaehlerMitAblesung,
        vollstaendigkeitsquote,
        nachTyp,
      };
    }),

  // =========================================================================
  // 8) MIETEANALYSE
  // =========================================================================
  mieteAnalyse: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    // Active mietverhaeltnisse: auszugsdatum IS NULL
    const aktiveMV = await ctx.db.mietverhaeltnis.findMany({
      where: {
        tenantId,
        auszugsdatum: null,
      },
      select: {
        kaltmiete: true,
        bkVorauszahlung: true,
        hkVorauszahlung: true,
        einheit: {
          select: { flaeche: true },
        },
      },
    });

    let gesamtKaltmiete = 0;
    let gesamtWarmmiete = 0;
    let sumKaltProQm = 0;
    let countMitFlaeche = 0;

    for (const mv of aktiveMV) {
      const kalt = d2n(mv.kaltmiete);
      const bk = d2n(mv.bkVorauszahlung);
      const hk = d2n(mv.hkVorauszahlung);
      const flaeche = d2n(mv.einheit.flaeche);

      gesamtKaltmiete += kalt;
      gesamtWarmmiete += kalt + bk + hk;

      if (flaeche > 0) {
        sumKaltProQm += kalt / flaeche;
        countMitFlaeche++;
      }
    }

    const avgKaltmieteProQm =
      countMitFlaeche > 0
        ? parseFloat((sumKaltProQm / countMitFlaeche).toFixed(2))
        : 0;

    return {
      avgKaltmieteProQm,
      gesamtMonatlicheKaltmiete: parseFloat(gesamtKaltmiete.toFixed(2)),
      gesamtMonatlicheWarmmiete: parseFloat(gesamtWarmmiete.toFixed(2)),
      mietverhaeltnisseAktiv: aktiveMV.length,
    };
  }),

  // =========================================================================
  // 9) DATENQUALITAET
  // =========================================================================
  datenqualitaet: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const [
      unklareZahlungen,
      unklareZahlungenAgg,
      aeltesteUnklareZahlung,
      einheitenOhneFlaeche,
      mvOhneKaltmiete,
      objekteOhneAdresse,
      mieterOhneKontakt,
    ] = await Promise.all([
      // Count UNKLAR zahlungen
      ctx.db.zahlung.count({
        where: { tenantId, status: "UNKLAR" },
      }),
      // Sum UNKLAR zahlungen
      ctx.db.zahlung.aggregate({
        where: { tenantId, status: "UNKLAR" },
        _sum: { betrag: true },
      }),
      // Oldest UNKLAR zahlung
      ctx.db.zahlung.findFirst({
        where: { tenantId, status: "UNKLAR" },
        orderBy: { datum: "asc" },
        select: { datum: true },
      }),
      // Einheiten where flaeche = 0 or null (Decimal 0 check via raw)
      ctx.db.einheit.count({
        where: {
          tenantId,
          OR: [{ flaeche: { equals: 0 } }],
        },
      }),
      // Mietverhaeltnisse where kaltmiete = 0
      ctx.db.mietverhaeltnis.count({
        where: {
          tenantId,
          kaltmiete: { equals: 0 },
        },
      }),
      // Objekte without strasse (= no address) -- strasse is required in schema so only check empty string
      ctx.db.objekt.count({
        where: {
          tenantId,
          strasse: "",
        },
      }),
      // Mieter without any contact info
      ctx.db.mieter.count({
        where: {
          tenantId,
          AND: [
            { OR: [{ email: null }, { email: "" }] },
            { OR: [{ telefonMobil: null }, { telefonMobil: "" }] },
            { OR: [{ telefonFestnetz: null }, { telefonFestnetz: "" }] },
            { OR: [{ telefon: null }, { telefon: "" }] },
          ],
        },
      }),
    ]);

    return {
      unzugeordneteZahlungen: unklareZahlungen,
      unzugeordneteZahlungenSumme: d2n(unklareZahlungenAgg._sum.betrag),
      aeltesteUnzugeordneteZahlung: aeltesteUnklareZahlung?.datum
        ? aeltesteUnklareZahlung.datum.toISOString()
        : null,
      stammdatenLuecken: {
        einheitenOhneFlaeche,
        mietverhaeltnisseOhneKaltmiete: mvOhneKaltmiete,
        objekteOhneAdresse,
        mieterOhneKontakt,
      },
    };
  }),

  // =========================================================================
  // 10) SOLL/IST MONATSVERLAUF
  // =========================================================================
  sollIstMonatlich: protectedProcedure
    .input(
      z
        .object({ jahr: z.number().optional() })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();

      const monate: {
        monat: string;
        soll: number;
        ist: number;
      }[] = [];

      const monatNamen = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
      ];

      for (let m = 0; m < 12; m++) {
        const start = new Date(jahr, m, 1);
        const end = new Date(jahr, m + 1, 0, 23, 59, 59);

        const [sollAgg, istAgg] = await Promise.all([
          ctx.db.sollstellung.aggregate({
            where: {
              tenantId,
              faelligkeitsdatum: { gte: start, lte: end },
              status: { not: "STORNIERT" },
            },
            _sum: { betragGesamt: true },
          }),
          ctx.db.sollstellung.aggregate({
            where: {
              tenantId,
              faelligkeitsdatum: { gte: start, lte: end },
              status: { not: "STORNIERT" },
            },
            _sum: { gedecktGesamt: true },
          }),
        ]);

        monate.push({
          monat: monatNamen[m],
          soll: d2n(sollAgg._sum.betragGesamt),
          ist: d2n(istAgg._sum.gedecktGesamt),
        });
      }

      return monate;
    }),

  // =========================================================================
  // 11) CASHFLOW MONATSVERLAUF
  // =========================================================================
  cashflowMonatlich: protectedProcedure
    .input(
      z
        .object({ jahr: z.number().optional() })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();

      const monatNamen = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
      ];

      const monate: {
        monat: string;
        einnahmen: number;
        ausgaben: number;
        cashflow: number;
      }[] = [];

      for (let m = 0; m < 12; m++) {
        const start = new Date(jahr, m, 1);
        const end = new Date(jahr, m + 1, 0, 23, 59, 59);

        const [einnahmenAgg, ausgabenAgg] = await Promise.all([
          ctx.db.zahlung.aggregate({
            where: {
              tenantId,
              datum: { gte: start, lte: end },
              status: { in: ["ZUGEORDNET", "TEILWEISE_ZUGEORDNET", "SPLITTET"] },
            },
            _sum: { betrag: true },
          }),
          ctx.db.kosten.aggregate({
            where: {
              tenantId,
              datum: { gte: start, lte: end },
            },
            _sum: { betragBrutto: true },
          }),
        ]);

        const einnahmen = d2n(einnahmenAgg._sum.betrag);
        const ausgaben = d2n(ausgabenAgg._sum.betragBrutto);

        monate.push({
          monat: monatNamen[m],
          einnahmen,
          ausgaben,
          cashflow: parseFloat((einnahmen - ausgaben).toFixed(2)),
        });
      }

      return monate;
    }),

  // =========================================================================
  // 12) KOSTEN MONATSVERLAUF
  // =========================================================================
  kostenMonatlich: protectedProcedure
    .input(
      z
        .object({ jahr: z.number().optional() })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();

      const monatNamen = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
      ];

      const monate: {
        monat: string;
        bk: number;
        hk: number;
        sonstige: number;
        gesamt: number;
      }[] = [];

      for (let m = 0; m < 12; m++) {
        const start = new Date(jahr, m, 1);
        const end = new Date(jahr, m + 1, 0, 23, 59, 59);

        const kostenAll = await ctx.db.kosten.findMany({
          where: { tenantId, datum: { gte: start, lte: end } },
          select: { betragBrutto: true, bkRelevant: true, hkRelevant: true },
        });

        let bk = 0;
        let hk = 0;
        let sonstige = 0;
        for (const k of kostenAll) {
          const betrag = d2n(k.betragBrutto);
          if (k.bkRelevant) bk += betrag;
          else if (k.hkRelevant) hk += betrag;
          else sonstige += betrag;
        }

        monate.push({
          monat: monatNamen[m],
          bk: parseFloat(bk.toFixed(2)),
          hk: parseFloat(hk.toFixed(2)),
          sonstige: parseFloat(sonstige.toFixed(2)),
          gesamt: parseFloat((bk + hk + sonstige).toFixed(2)),
        });
      }

      return monate;
    }),

  // =========================================================================
  // 14) KPI SNAPSHOTS speichern (wird beim Dashboard-Laden getriggert)
  // =========================================================================
  saveSnapshots: protectedProcedure.mutation(async ({ ctx }) => {
    const tenantId = ctx.tenantId;
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const fmt = (n: number) =>
      new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
    const pct = (n: number) => `${n.toFixed(1)} %`;
    const num = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 2 });

    // Alle benötigten Werte parallel abfragen
    const [
      objekteCount,
      einheitenAll,
      mvFluktuationsCount,
      sollAgg,
      istAgg,
      rueckstandAgg,
      cashEin,
      cashAus,
      kostenAgg,
      kostenFlaecheAgg,
      aktiveMV,
      offeneTickets,
      kritTickets,
      kreditRateAgg,
      zaehlerCount,
      zaehlerMitAblesung,
      unklareZ,
    ] = await Promise.all([
      ctx.db.objekt.count({ where: { tenantId } }),
      ctx.db.einheit.findMany({ where: { tenantId }, select: { status: true, flaeche: true } }),
      ctx.db.mietverhaeltnis.count({
        where: { tenantId, auszugsdatum: { gte: yearStart, lte: yearEnd } },
      }),
      ctx.db.sollstellung.aggregate({
        where: { tenantId, status: { not: "STORNIERT" } },
        _sum: { betragGesamt: true },
      }),
      ctx.db.sollstellung.aggregate({
        where: { tenantId, status: { not: "STORNIERT" } },
        _sum: { gedecktGesamt: true },
      }),
      ctx.db.sollstellung.aggregate({
        where: { tenantId, status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] } },
        _sum: { betragGesamt: true, gedecktGesamt: true },
      }),
      ctx.db.zahlung.aggregate({
        where: { tenantId, status: { in: ["ZUGEORDNET", "TEILWEISE_ZUGEORDNET", "SPLITTET"] } },
        _sum: { betrag: true },
      }),
      ctx.db.kosten.aggregate({ where: { tenantId }, _sum: { betragBrutto: true } }),
      ctx.db.kosten.aggregate({ where: { tenantId, datum: { gte: yearStart, lte: yearEnd } }, _sum: { betragBrutto: true } }),
      ctx.db.einheit.aggregate({ where: { tenantId }, _sum: { flaeche: true } }),
      ctx.db.mietverhaeltnis.findMany({
        where: { tenantId, auszugsdatum: null },
        select: { kaltmiete: true, einheit: { select: { flaeche: true } } },
      }),
      ctx.db.ticket.count({ where: { tenantId, status: { not: "ABGESCHLOSSEN" } } }),
      ctx.db.ticket.count({ where: { tenantId, status: { not: "ABGESCHLOSSEN" }, prioritaet: { in: ["HOCH", "KRITISCH"] } } }),
      ctx.db.kredit.aggregate({ where: { tenantId }, _sum: { rate: true } }),
      ctx.db.zaehler.count({ where: { tenantId } }),
      ctx.db.zaehlerstand.groupBy({
        by: ["zaehlerId"],
        where: { tenantId, datum: { gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) } },
        _count: { id: true },
      }),
      ctx.db.zahlung.count({ where: { tenantId, status: "UNKLAR" } }),
    ]);

    // Berechnungen
    const einheitenGesamt   = einheitenAll.length;
    const einheitenVermietet= einheitenAll.filter(e => e.status === "VERMIETET").length;
    const einheitenLeer     = einheitenGesamt - einheitenVermietet;
    const gesamtFlaeche     = d2n(kostenFlaecheAgg._sum.flaeche);

    const soll         = d2n(sollAgg._sum.betragGesamt);
    const ist          = d2n(istAgg._sum.gedecktGesamt);
    const rueckstaende = d2n(rueckstandAgg._sum.betragGesamt) - d2n(rueckstandAgg._sum.gedecktGesamt);
    const cashflow     = d2n(cashEin._sum.betrag) - d2n(cashAus._sum.betragBrutto);
    const debtService  = d2n(kreditRateAgg._sum.rate);
    const cashflowND   = cashflow - debtService;
    const kostenJahr   = d2n(kostenAgg._sum.betragBrutto);
    const kostenProQm  = gesamtFlaeche > 0 ? parseFloat((kostenJahr / gesamtFlaeche).toFixed(2)) : 0;

    const vermietungsquote  = pct(einheitenGesamt > 0 ? (einheitenVermietet / einheitenGesamt) * 100 : 0);
    const leerstandsquote   = pct(einheitenGesamt > 0 ? (einheitenLeer / einheitenGesamt) * 100 : 0);
    const fluktuationsquote = pct(einheitenGesamt > 0 ? (mvFluktuationsCount / einheitenGesamt) * 100 : 0);
    const einzugsquote      = pct(soll > 0 ? (ist / soll) * 100 : 0);

    const gesamtKaltmiete   = aktiveMV.reduce((s, mv) => s + d2n(mv.kaltmiete), 0);
    const aktiveMVFlaeche   = aktiveMV.reduce((s, mv) => s + d2n(mv.einheit?.flaeche ?? 0), 0);
    const kaltmieteProQm    = aktiveMVFlaeche > 0 ? parseFloat((gesamtKaltmiete / aktiveMVFlaeche).toFixed(2)) : 0;

    const zaehlerMitAblesungCount = zaehlerMitAblesung.length;
    const zaehlerVollstaendigkeitPct = zaehlerCount > 0
      ? parseFloat(((zaehlerMitAblesungCount / zaehlerCount) * 100).toFixed(1)) : 100;

    // Ertragsverlust Leerstand: leere Einheiten * avgKaltmieteProQm * avgFlaeche
    const avgKaltmieteProQm = kaltmieteProQm;
    const avgLeereFlaeche   = einheitenLeer > 0
      ? einheitenAll.filter(e => e.status !== "VERMIETET").reduce((s, e) => s + d2n(e.flaeche), 0) / einheitenLeer
      : 0;
    const ertragsverlust    = einheitenLeer * avgKaltmieteProQm * avgLeereFlaeche;

    const snapshots: { widgetTyp: string; wertText: string; wertZahl: number }[] = [
      // Kern-KPIs
      { widgetTyp: "objekte",              wertText: String(objekteCount),        wertZahl: objekteCount },
      { widgetTyp: "einheiten",            wertText: String(einheitenGesamt),     wertZahl: einheitenGesamt },
      { widgetTyp: "rueckstaende",         wertText: fmt(rueckstaende),           wertZahl: rueckstaende },
      { widgetTyp: "tickets",              wertText: String(offeneTickets),       wertZahl: offeneTickets },
      // Vermietung
      { widgetTyp: "vermietungsquote",     wertText: vermietungsquote,            wertZahl: parseFloat(vermietungsquote) },
      { widgetTyp: "belegungsquote",       wertText: vermietungsquote,            wertZahl: parseFloat(vermietungsquote) },
      { widgetTyp: "leerstandsquote",      wertText: leerstandsquote,             wertZahl: parseFloat(leerstandsquote) },
      { widgetTyp: "fluktuationsquote",    wertText: fluktuationsquote,           wertZahl: parseFloat(fluktuationsquote) },
      { widgetTyp: "ertragsverlustLeerstand", wertText: fmt(ertragsverlust),     wertZahl: ertragsverlust },
      { widgetTyp: "leerstandsdauer",      wertText: `${einheitenLeer} leer`,    wertZahl: einheitenLeer },
      // Soll/Ist
      { widgetTyp: "sollstellungen",       wertText: fmt(soll),                  wertZahl: soll },
      { widgetTyp: "istzahlungen",         wertText: fmt(ist),                   wertZahl: ist },
      { widgetTyp: "einzugsquote",         wertText: einzugsquote,               wertZahl: parseFloat(einzugsquote) },
      { widgetTyp: "mietrueckstaende",     wertText: fmt(rueckstaende),          wertZahl: rueckstaende },
      { widgetTyp: "agingRueckstaende",    wertText: fmt(rueckstaende),          wertZahl: rueckstaende },
      { widgetTyp: "zahlungsverzug",       wertText: fmt(rueckstaende),          wertZahl: rueckstaende },
      // Cashflow
      { widgetTyp: "operativerCashflow",   wertText: fmt(cashflow),              wertZahl: cashflow },
      { widgetTyp: "cashflowNachDebt",     wertText: fmt(cashflowND),            wertZahl: cashflowND },
      { widgetTyp: "debtService",          wertText: fmt(debtService),           wertZahl: debtService },
      // Kosten
      { widgetTyp: "kostenGesamt",         wertText: fmt(kostenJahr),            wertZahl: kostenJahr },
      { widgetTyp: "kostenProQm",          wertText: `${num(kostenProQm)} €/m²`, wertZahl: kostenProQm },
      { widgetTyp: "kostenNachKategorie",  wertText: fmt(kostenJahr),            wertZahl: kostenJahr },
      { widgetTyp: "kostenVerlauf",        wertText: fmt(kostenJahr),            wertZahl: kostenJahr },
      // Miete
      { widgetTyp: "kaltmieteProQm",       wertText: `${num(kaltmieteProQm)} €/m²`, wertZahl: kaltmieteProQm },
      { widgetTyp: "gesamtMiete",          wertText: fmt(gesamtKaltmiete),       wertZahl: gesamtKaltmiete },
      // Tickets
      { widgetTyp: "ticketsPrioritaet",    wertText: `${kritTickets} kritisch`,  wertZahl: kritTickets },
      { widgetTyp: "ticketBearbeitungszeit", wertText: String(offeneTickets),   wertZahl: offeneTickets },
      { widgetTyp: "ticketKategorien",     wertText: String(offeneTickets),      wertZahl: offeneTickets },
      { widgetTyp: "handlungsbedarf",      wertText: String(offeneTickets),      wertZahl: offeneTickets },
      // Zähler
      { widgetTyp: "zaehlerVollstaendigkeit", wertText: pct(zaehlerVollstaendigkeitPct), wertZahl: zaehlerVollstaendigkeitPct },
      // Datenqualität
      { widgetTyp: "unzugeordneteZahlungen", wertText: String(unklareZ),        wertZahl: unklareZ },
      { widgetTyp: "datenqualitaet",       wertText: String(unklareZ),           wertZahl: unklareZ },
      { widgetTyp: "stammdatenLuecken",    wertText: String(unklareZ),           wertZahl: unklareZ },
      // Charts (Jahres-Gesamtwert als Snapshot)
      { widgetTyp: "sollIstVerlauf",       wertText: `Soll ${fmt(soll)} / Ist ${fmt(ist)}`, wertZahl: ist },
      { widgetTyp: "cashflowVerlauf",      wertText: fmt(cashflow),              wertZahl: cashflow },
      { widgetTyp: "ticketsVerlauf",       wertText: String(offeneTickets),      wertZahl: offeneTickets },
    ];

    // Letzten Snapshot pro Widget-Typ in einem Query holen
    const lastSnaps = await ctx.db.kPISnapshot.findMany({
      where: { tenantId, widgetTyp: { in: snapshots.map(s => s.widgetTyp) } },
      orderBy: { createdAt: "desc" },
      distinct: ["widgetTyp"],
      select: { widgetTyp: true, wertZahl: true },
    });
    const lastByType: Record<string, number | null> = Object.fromEntries(
      lastSnaps.map(s => [s.widgetTyp, s.wertZahl])
    );

    // Nur geänderte Werte einfügen (createMany für Effizienz)
    const toCreate = snapshots.filter(s => {
      const last = lastByType[s.widgetTyp];
      return last === undefined || Math.abs((last ?? 0) - s.wertZahl) > 0.001;
    });

    if (toCreate.length > 0) {
      await ctx.db.kPISnapshot.createMany({
        data: toCreate.map(s => ({ tenantId, widgetTyp: s.widgetTyp, wertText: s.wertText, wertZahl: s.wertZahl })),
      });
    }

    return { ok: true, saved: toCreate.length };
  }),

  // =========================================================================
  // 15) KPI SNAPSHOT VERLAUF abfragen
  // =========================================================================
  kpiVerlauf: protectedProcedure
    .input(z.object({ widgetTyp: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.kPISnapshot.findMany({
        where: { tenantId: ctx.tenantId, widgetTyp: input.widgetTyp },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return rows.map((r) => ({
        id: r.id,
        wertText: r.wertText,
        wertZahl: r.wertZahl,
        datum: r.createdAt.toISOString(),
      }));
    }),

  // =========================================================================
  // 16) VERLAUF (Widget-spezifische Ereignishistorie)
  // =========================================================================
  verlauf: protectedProcedure
    .input(z.object({ widgetTyp: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const { widgetTyp } = input;

      type Eintrag = {
        id: string;
        datum: string;
        titel: string;
        beschreibung: string;
        betrag?: number;
        status?: string;
        typ: string;
      };

      const fmt = (n: number) =>
        new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

      const ZAHLUNG_WIDGETS = [
        "rueckstaende", "sollIst", "mietrueckstaende", "agingRueckstaende",
        "zahlungsverzug", "sollstellungen", "istzahlungen", "einzugsquote",
        "operativerCashflow", "cashflowNachDebt", "debtService",
        "sollIstVerlauf", "cashflowVerlauf", "unzugeordneteZahlungen", "datenqualitaet",
      ];
      const TICKET_WIDGETS = [
        "tickets", "ticketsPrioritaet", "ticketBearbeitungszeit",
        "ticketKategorien", "ticketsVerlauf", "handlungsbedarf",
      ];
      const EINHEIT_WIDGETS = [
        "einheiten", "belegungsquote", "leerstandsquote", "leerstandsdauer",
        "fluktuationsquote", "ertragsverlustLeerstand", "vermietungsquote",
      ];
      const KOSTEN_WIDGETS = ["kostenGesamt", "kostenProQm", "kostenNachKategorie", "kostenVerlauf"];
      const KREDIT_WIDGETS = ["finanzierung", "restschuld", "dscr", "kredituebersicht"];
      const ZAEHLER_WIDGETS = ["zaehlerVollstaendigkeit"];
      const MIETE_WIDGETS = ["kaltmieteProQm", "gesamtMiete"];

      const eintraege: Eintrag[] = [];

      if (ZAHLUNG_WIDGETS.includes(widgetTyp)) {
        const zahlungen = await ctx.db.zahlung.findMany({
          where: { tenantId },
          orderBy: { datum: "desc" },
          take: 50,
          include: {
            zuordnungen: {
              take: 1,
              include: {
                sollstellung: {
                  include: {
                    mietverhaeltnis: {
                      include: {
                        mieter: { select: { vorname: true, nachname: true } },
                        einheit: {
                          select: {
                            einheitNr: true,
                            objekt: { select: { bezeichnung: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        for (const z of zahlungen) {
          const betrag = d2n(z.betrag);
          const mv = z.zuordnungen[0]?.sollstellung?.mietverhaeltnis;
          const mieter = mv?.mieter;
          const einheit = mv?.einheit;
          let titel = "Zahlung";
          let beschreibung = fmt(betrag);
          if (mieter) {
            titel = `${mieter.vorname ?? ""} ${mieter.nachname}`.trim();
            beschreibung = `${fmt(betrag)} · ${einheit?.objekt.bezeichnung ?? ""} ${einheit?.einheitNr ? `EH ${einheit.einheitNr}` : ""}`.trim();
          } else if (z.verwendungszweck) {
            beschreibung = `${fmt(betrag)} · ${z.verwendungszweck.substring(0, 60)}`;
          }
          eintraege.push({ id: z.id, datum: z.datum.toISOString(), titel, beschreibung, betrag, status: z.status, typ: "zahlung" });
        }

      } else if (TICKET_WIDGETS.includes(widgetTyp)) {
        const tickets = await ctx.db.ticket.findMany({
          where: { tenantId },
          orderBy: { updatedAt: "desc" },
          take: 50,
          select: { id: true, titel: true, status: true, prioritaet: true, createdAt: true, updatedAt: true, kategorie: true },
        });
        const statusLabel: Record<string, string> = { ERFASST: "Erfasst", IN_BEARBEITUNG: "In Bearbeitung", ZUR_PRUEFUNG: "Zur Prüfung", ABGESCHLOSSEN: "Abgeschlossen" };
        const prioLabel: Record<string, string> = { NIEDRIG: "Niedrig", MITTEL: "Mittel", HOCH: "Hoch", KRITISCH: "Kritisch" };
        for (const t of tickets) {
          eintraege.push({
            id: t.id, datum: t.updatedAt.toISOString(), titel: t.titel,
            beschreibung: `${statusLabel[t.status] ?? t.status} · Priorität: ${prioLabel[t.prioritaet] ?? t.prioritaet} · ${t.kategorie}`,
            status: t.status, typ: "ticket",
          });
        }

      } else if (EINHEIT_WIDGETS.includes(widgetTyp)) {
        const statusHistorie = await ctx.db.einheitStatusHistorie.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            einheit: { select: { einheitNr: true, objekt: { select: { bezeichnung: true } } } },
          },
        });
        const statusLabel: Record<string, string> = { VERFUEGBAR: "Verfügbar", VERMIETET: "Vermietet", KUENDIGUNG: "Kündigung", SANIERUNG: "Sanierung", RESERVIERT: "Reserviert" };
        for (const s of statusHistorie) {
          eintraege.push({
            id: s.id, datum: s.createdAt.toISOString(),
            titel: `${s.einheit.objekt.bezeichnung} · EH ${s.einheit.einheitNr}`,
            beschreibung: `Status: ${statusLabel[s.status] ?? s.status}${s.notiz ? ` · ${s.notiz}` : ""}`,
            status: s.status, typ: "einheit",
          });
        }
        if (eintraege.length === 0) {
          const mietverhaeltnisse = await ctx.db.mietverhaeltnis.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
              mieter: { select: { vorname: true, nachname: true } },
              einheit: { select: { einheitNr: true, objekt: { select: { bezeichnung: true } } } },
            },
          });
          for (const mv of mietverhaeltnisse) {
            const kaltmiete = d2n(mv.kaltmiete);
            eintraege.push({
              id: mv.id, datum: mv.createdAt.toISOString(),
              titel: `${mv.mieter.vorname ?? ""} ${mv.mieter.nachname}`.trim(),
              beschreibung: `Einzug: ${mv.einzugsdatum.toLocaleDateString("de-DE")} · ${mv.einheit.objekt.bezeichnung} EH ${mv.einheit.einheitNr} · ${fmt(kaltmiete)}`,
              betrag: kaltmiete, typ: "einheit",
            });
          }
        }

      } else if (KOSTEN_WIDGETS.includes(widgetTyp)) {
        const kosten = await ctx.db.kosten.findMany({
          where: { tenantId },
          orderBy: { datum: "desc" },
          take: 50,
          select: { id: true, datum: true, betragBrutto: true, lieferant: true, kategorie: true, beschreibung: true },
        });
        for (const k of kosten) {
          const betrag = d2n(k.betragBrutto);
          eintraege.push({
            id: k.id, datum: k.datum.toISOString(), titel: k.lieferant,
            beschreibung: `${fmt(betrag)} · ${k.kategorie}${k.beschreibung ? ` · ${k.beschreibung.substring(0, 60)}` : ""}`,
            betrag, typ: "kosten",
          });
        }

      } else if (KREDIT_WIDGETS.includes(widgetTyp)) {
        const sondertilgungen = await ctx.db.sondertilgung.findMany({
          where: { tenantId },
          orderBy: { datum: "desc" },
          take: 50,
          include: { kredit: { select: { bezeichnung: true, bank: true } } },
        });
        for (const s of sondertilgungen) {
          const betrag = d2n(s.betrag);
          eintraege.push({
            id: s.id, datum: s.datum.toISOString(),
            titel: `Sondertilgung – ${s.kredit.bezeichnung}`,
            beschreibung: `${fmt(betrag)} · ${s.kredit.bank}${s.notiz ? ` · ${s.notiz}` : ""}`,
            betrag, typ: "kredit",
          });
        }
        if (eintraege.length === 0) {
          const kredite = await ctx.db.kredit.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { id: true, bezeichnung: true, bank: true, ursprungsbetrag: true, createdAt: true, startdatum: true },
          });
          for (const k of kredite) {
            const betrag = d2n(k.ursprungsbetrag);
            eintraege.push({
              id: k.id, datum: k.createdAt.toISOString(), titel: k.bezeichnung,
              beschreibung: `${k.bank} · Darlehen: ${fmt(betrag)} · Start: ${k.startdatum.toLocaleDateString("de-DE")}`,
              betrag, typ: "kredit",
            });
          }
        }

      } else if (ZAEHLER_WIDGETS.includes(widgetTyp)) {
        const ablesungen = await ctx.db.zaehlerstand.findMany({
          where: { tenantId },
          orderBy: { datum: "desc" },
          take: 50,
          include: { zaehler: { select: { zaehlernummer: true, typ: true } } },
        });
        const zaehlerTypLabel: Record<string, string> = { STROM: "Strom", GAS: "Gas", WASSER_KALT: "Wasser (kalt)", WASSER_WARM: "Wasser (warm)", WAERME: "Wärme" };
        for (const a of ablesungen) {
          eintraege.push({
            id: a.id, datum: a.datum.toISOString(),
            titel: `${zaehlerTypLabel[a.zaehler.typ] ?? a.zaehler.typ} – Nr. ${a.zaehler.zaehlernummer}`,
            beschreibung: `Stand: ${d2n(a.stand).toLocaleString("de-DE")}${a.ablesesTyp === "EINZUG" ? " · Einzug" : a.ablesesTyp === "AUSZUG" ? " · Auszug" : ""}${a.notiz ? ` · ${a.notiz}` : ""}`,
            typ: "zaehler",
          });
        }

      } else if (MIETE_WIDGETS.includes(widgetTyp)) {
        const mietverhaeltnisse = await ctx.db.mietverhaeltnis.findMany({
          where: { tenantId },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            mieter: { select: { vorname: true, nachname: true } },
            einheit: { select: { einheitNr: true, objekt: { select: { bezeichnung: true } } } },
          },
        });
        for (const mv of mietverhaeltnisse) {
          const kaltmiete = d2n(mv.kaltmiete);
          eintraege.push({
            id: mv.id, datum: mv.createdAt.toISOString(),
            titel: `${mv.mieter.vorname ?? ""} ${mv.mieter.nachname}`.trim(),
            beschreibung: `${mv.einheit.objekt.bezeichnung} EH ${mv.einheit.einheitNr} · ${fmt(kaltmiete)} · Einzug: ${mv.einzugsdatum.toLocaleDateString("de-DE")}`,
            betrag: kaltmiete, typ: "miete",
          });
        }

      } else {
        // Fallback: Objekte
        const objekte = await ctx.db.objekt.findMany({
          where: { tenantId },
          orderBy: { updatedAt: "desc" },
          take: 20,
          select: { id: true, bezeichnung: true, strasse: true, plz: true, ort: true, updatedAt: true },
        });
        for (const o of objekte) {
          eintraege.push({
            id: o.id, datum: o.updatedAt.toISOString(), titel: o.bezeichnung,
            beschreibung: `${o.strasse}, ${o.plz} ${o.ort}`, typ: "objekt",
          });
        }
      }

      return { eintraege: eintraege.slice(0, 50) };
    }),

  // =========================================================================
  // 13) TICKETS MONATSVERLAUF
  // =========================================================================
  ticketsMonatlich: protectedProcedure
    .input(
      z
        .object({ jahr: z.number().optional() })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const tenantId = ctx.tenantId;
      const jahr = input?.jahr ?? new Date().getFullYear();

      const monatNamen = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
      ];

      const monate: {
        monat: string;
        neu: number;
        abgeschlossen: number;
      }[] = [];

      for (let m = 0; m < 12; m++) {
        const start = new Date(jahr, m, 1);
        const end = new Date(jahr, m + 1, 0, 23, 59, 59);

        const [neu, abgeschlossen] = await Promise.all([
          ctx.db.ticket.count({
            where: {
              tenantId,
              createdAt: { gte: start, lte: end },
            },
          }),
          ctx.db.ticket.count({
            where: {
              tenantId,
              status: "ABGESCHLOSSEN",
              updatedAt: { gte: start, lte: end },
            },
          }),
        ]);

        monate.push({
          monat: monatNamen[m],
          neu,
          abgeschlossen,
        });
      }

      return monate;
    }),
});
