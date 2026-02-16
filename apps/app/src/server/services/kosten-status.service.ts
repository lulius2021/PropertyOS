/**
 * Kosten Status Service
 * Berechnet Zahlungsstatus und Restbeträge für Kostenpositionen
 */

import { Decimal } from "@prisma/client/runtime/library";

export type KostenZahlungStatus = "OFFEN" | "TEILBEZAHLT" | "BEZAHLT";

export interface KostenMitStatus {
  id: string;
  betragBrutto: Decimal;
  faelligkeitsdatum: Date | null;
  zahlungen: Array<{ betrag: Decimal }>;
}

/**
 * Berechnet den Zahlungsstatus einer Kostenposition
 */
export function berechneZahlungsstatus(
  betragBrutto: number,
  summeZahlungen: number
): KostenZahlungStatus {
  if (summeZahlungen === 0) {
    return "OFFEN";
  }
  if (summeZahlungen >= betragBrutto) {
    return "BEZAHLT";
  }
  return "TEILBEZAHLT";
}

/**
 * Berechnet den Restbetrag einer Kostenposition
 */
export function berechneRestbetrag(
  betragBrutto: number,
  summeZahlungen: number
): number {
  const rest = betragBrutto - summeZahlungen;
  return Math.max(0, Math.round(rest * 100) / 100);
}

/**
 * Prüft ob eine Kostenposition überfällig ist
 */
export function istUeberfaellig(
  faelligkeitsdatum: Date | null,
  zahlungsstatus: KostenZahlungStatus
): boolean {
  if (!faelligkeitsdatum || zahlungsstatus === "BEZAHLT") {
    return false;
  }
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  return faelligkeitsdatum < heute;
}

/**
 * Berechnet vollständigen Status für eine Kostenposition
 */
export function berechneKostenStatus(kosten: KostenMitStatus) {
  const betragBrutto = parseFloat(kosten.betragBrutto.toString());
  const summeZahlungen = kosten.zahlungen.reduce(
    (sum, z) => sum + parseFloat(z.betrag.toString()),
    0
  );

  const zahlungsstatus = berechneZahlungsstatus(betragBrutto, summeZahlungen);
  const restbetrag = berechneRestbetrag(betragBrutto, summeZahlungen);
  const ueberfaellig = istUeberfaellig(kosten.faelligkeitsdatum, zahlungsstatus);

  return {
    zahlungsstatus,
    restbetrag,
    ueberfaellig,
    summeZahlungen,
  };
}
