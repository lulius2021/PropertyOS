/**
 * Bank Matching Service
 * Automatically matches payments to Sollstellungen based on heuristic rules
 */

import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { ordneZahlungZu } from "./deckung.service";

interface AutoMatchResult {
  zahlungId: string;
  matched: boolean;
  zuordnungen?: any[];
  reason?: string;
}

/**
 * Versucht eine Zahlung automatisch einer Sollstellung zuzuordnen
 * Matching-Regeln (Priorität):
 * 1. Einheit-ID im Verwendungszweck + Betrag stimmt überein
 * 2. Mieter-Name im Verwendungszweck + Betrag + Zeitraum
 * 3. IBAN-Match + Betrag + Zeitraum
 */
export async function autoMatchZahlung(
  zahlungId: string,
  tenantId: string
): Promise<AutoMatchResult> {
  const zahlung = await db.zahlung.findUnique({
    where: { id: zahlungId },
  });

  if (!zahlung) {
    return { zahlungId, matched: false, reason: "Zahlung nicht gefunden" };
  }

  if (zahlung.tenantId !== tenantId) {
    return { zahlungId, matched: false, reason: "Zugriff verweigert" };
  }

  if (zahlung.status !== "UNKLAR") {
    return {
      zahlungId,
      matched: false,
      reason: "Zahlung bereits zugeordnet oder ignoriert",
    };
  }

  const verwendungszweck = zahlung.verwendungszweck.toLowerCase();
  const betrag = new Decimal(zahlung.betrag.toString());

  // Zeitfenster: ±30 Tage vom Zahlungsdatum
  const dateFrom = new Date(zahlung.datum);
  dateFrom.setDate(dateFrom.getDate() - 30);
  const dateTo = new Date(zahlung.datum);
  dateTo.setDate(dateTo.getDate() + 30);

  // REGEL 1: Einheit-ID im Verwendungszweck
  const einheitNrMatch = verwendungszweck.match(/einheit[:\s-]*(\w+)/i);
  if (einheitNrMatch) {
    const einheitNr = einheitNrMatch[1];

    const einheit = await db.einheit.findFirst({
      where: {
        tenantId,
        einheitNr: {
          contains: einheitNr,
          mode: "insensitive",
        },
      },
    });

    if (einheit) {
      // Sollstellungen für diese Einheit suchen
      const sollstellungen = await db.sollstellung.findMany({
        where: {
          tenantId,
          status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] },
          faelligkeitsdatum: {
            gte: dateFrom,
            lte: dateTo,
          },
          mietverhaeltnis: {
            einheitId: einheit.id,
          },
        },
        orderBy: { faelligkeitsdatum: "asc" },
      });

      // Sollstellung mit passendem Betrag finden
      const match = sollstellungen.find((s) => {
        const offen = new Decimal(s.betragGesamt.toString()).minus(
          s.gedecktGesamt.toString()
        );
        return betrag.equals(offen) || betrag.equals(s.betragGesamt.toString());
      });

      if (match) {
        try {
          const zuordnung = await ordneZahlungZu({
            zahlungId,
            sollstellungId: match.id,
            betrag,
            tenantId,
          });
          return {
            zahlungId,
            matched: true,
            zuordnungen: [zuordnung],
            reason: "Einheit-ID Match",
          };
        } catch (error) {
          return {
            zahlungId,
            matched: false,
            reason: `Einheit gefunden, aber Zuordnung fehlgeschlagen: ${(error as Error).message}`,
          };
        }
      }
    }
  }

  // REGEL 2: Mieter-Name im Verwendungszweck
  const mieter = await db.mieter.findMany({
    where: { tenantId },
  });

  for (const m of mieter) {
    const suchbegriffe = [
      m.nachname.toLowerCase(),
      m.firma?.toLowerCase(),
    ].filter(Boolean);

    const nameGefunden = suchbegriffe.some((begriff) =>
      verwendungszweck.includes(begriff!)
    );

    if (nameGefunden) {
      // Sollstellungen für diesen Mieter suchen
      const sollstellungen = await db.sollstellung.findMany({
        where: {
          tenantId,
          status: { in: ["OFFEN", "TEILWEISE_BEZAHLT"] },
          faelligkeitsdatum: {
            gte: dateFrom,
            lte: dateTo,
          },
          mietverhaeltnis: {
            mieterId: m.id,
          },
        },
        orderBy: { faelligkeitsdatum: "asc" },
      });

      const match = sollstellungen.find((s) => {
        const offen = new Decimal(s.betragGesamt.toString()).minus(
          s.gedecktGesamt.toString()
        );
        return betrag.equals(offen) || betrag.equals(s.betragGesamt.toString());
      });

      if (match) {
        try {
          const zuordnung = await ordneZahlungZu({
            zahlungId,
            sollstellungId: match.id,
            betrag,
            tenantId,
          });
          return {
            zahlungId,
            matched: true,
            zuordnungen: [zuordnung],
            reason: "Mieter-Name Match",
          };
        } catch (error) {
          return {
            zahlungId,
            matched: false,
            reason: `Mieter gefunden, aber Zuordnung fehlgeschlagen: ${(error as Error).message}`,
          };
        }
      }
    }
  }

  // REGEL 3: IBAN-Match (falls vorhanden)
  if (zahlung.iban) {
    // TODO: IBAN-Matching (erfordert IBAN-Feld bei Mieter)
    // Aktuell nicht implementiert da Mieter-Model noch kein IBAN-Feld hat
  }

  // Kein Match gefunden
  return {
    zahlungId,
    matched: false,
    reason: "Keine automatische Zuordnung möglich",
  };
}

/**
 * Führt Auto-Matching für alle unklaren Zahlungen durch
 */
export async function autoMatchAlleUnklareZahlungen(tenantId: string) {
  const unklareZahlungen = await db.zahlung.findMany({
    where: {
      tenantId,
      status: "UNKLAR",
    },
  });

  const ergebnisse: AutoMatchResult[] = [];

  for (const zahlung of unklareZahlungen) {
    const result = await autoMatchZahlung(zahlung.id, tenantId);
    ergebnisse.push(result);
  }

  return {
    gesamt: unklareZahlungen.length,
    erfolgreich: ergebnisse.filter((r) => r.matched).length,
    fehlgeschlagen: ergebnisse.filter((r) => !r.matched).length,
    ergebnisse,
  };
}
