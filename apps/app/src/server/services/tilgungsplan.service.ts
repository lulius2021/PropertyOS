/**
 * Tilgungsplan Service
 * Berechnet Tilgungspläne für Darlehen mit Sondertilgungen
 */

export interface TilgungsplanEintrag {
  monat: number;
  datum: Date;
  restschuld: number;
  zinsen: number;
  tilgung: number;
  rate: number;
  sondertilgung: number;
  restschuldNachZahlung: number;
}

export interface Sondertilgung {
  datum: Date;
  betrag: number;
}

export interface TilgungsplanInput {
  ursprungsbetrag: number;
  zinssatz: number; // Dezimal, z.B. 0.0325 für 3.25%
  rate: number;
  startdatum: Date;
  laufzeitMonate: number;
  sondertilgungen?: Sondertilgung[];
}

/**
 * Berechnet den vollständigen Tilgungsplan
 */
export function berechneTilgungsplan(
  input: TilgungsplanInput
): TilgungsplanEintrag[] {
  const {
    ursprungsbetrag,
    zinssatz,
    rate,
    startdatum,
    laufzeitMonate,
    sondertilgungen = [],
  } = input;

  const plan: TilgungsplanEintrag[] = [];
  let restschuld = ursprungsbetrag;
  let monat = 0;

  // Sondertilgungen nach Datum sortieren
  const sortierteSondertilgungen = [...sondertilgungen].sort(
    (a, b) => a.datum.getTime() - b.datum.getTime()
  );

  while (restschuld > 0.01 && monat < laufzeitMonate * 2) {
    // Safety: max 2x geplante Laufzeit
    monat++;

    // Aktuelles Datum berechnen
    const aktuellesDatum = new Date(startdatum);
    aktuellesDatum.setMonth(aktuellesDatum.getMonth() + monat);

    // Monatliche Zinsen berechnen
    const monatlicherZinssatz = zinssatz / 12;
    const zinsen = restschuld * monatlicherZinssatz;

    // Tilgung berechnen
    let tilgung = rate - zinsen;

    // Wenn Tilgung größer als Restschuld, nur Restschuld tilgen
    if (tilgung > restschuld) {
      tilgung = restschuld;
    }

    // Restschuld nach regulärer Zahlung
    let restschuldNachZahlung = restschuld - tilgung;

    // Sondertilgungen für diesen Monat prüfen
    let sondertilgungBetrag = 0;
    for (const st of sortierteSondertilgungen) {
      const stMonat = Math.floor(
        (st.datum.getTime() - startdatum.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44)
      );

      if (stMonat === monat - 1) {
        // Sondertilgung in diesem Monat
        const maxSondertilgung = restschuldNachZahlung;
        const tatsaechlicheSondertilgung = Math.min(
          st.betrag,
          maxSondertilgung
        );
        sondertilgungBetrag += tatsaechlicheSondertilgung;
        restschuldNachZahlung -= tatsaechlicheSondertilgung;
      }
    }

    plan.push({
      monat,
      datum: aktuellesDatum,
      restschuld: Math.round(restschuld * 100) / 100,
      zinsen: Math.round(zinsen * 100) / 100,
      tilgung: Math.round(tilgung * 100) / 100,
      rate: Math.round((zinsen + tilgung) * 100) / 100,
      sondertilgung: Math.round(sondertilgungBetrag * 100) / 100,
      restschuldNachZahlung:
        Math.round(restschuldNachZahlung * 100) / 100,
    });

    restschuld = restschuldNachZahlung;

    // Abbruch wenn Restschuld sehr klein
    if (restschuld < 0.01) {
      break;
    }
  }

  return plan;
}

/**
 * Berechnet die Gesamtkosten eines Darlehens
 */
export function berechneGesamtkosten(
  plan: TilgungsplanEintrag[]
): {
  gesamtzinsen: number;
  gesamttilgung: number;
  gesamtkosten: number;
} {
  const gesamtzinsen = plan.reduce((sum, e) => sum + e.zinsen, 0);
  const gesamttilgung = plan.reduce((sum, e) => sum + e.tilgung, 0);
  const gesamtSondertilgung = plan.reduce(
    (sum, e) => sum + e.sondertilgung,
    0
  );

  return {
    gesamtzinsen: Math.round(gesamtzinsen * 100) / 100,
    gesamttilgung:
      Math.round((gesamttilgung + gesamtSondertilgung) * 100) / 100,
    gesamtkosten:
      Math.round((gesamtzinsen + gesamttilgung + gesamtSondertilgung) * 100) /
      100,
  };
}

/**
 * Berechnet die aktuelle Restschuld zu einem Stichtag
 */
export function berechneRestschuld(
  plan: TilgungsplanEintrag[],
  stichtag: Date
): number {
  // Finde den letzten Eintrag vor oder am Stichtag
  const relevanteEintraege = plan.filter(
    (e) => e.datum.getTime() <= stichtag.getTime()
  );

  if (relevanteEintraege.length === 0) {
    // Noch keine Zahlung erfolgt
    return plan[0]?.restschuld || 0;
  }

  const letzterEintrag = relevanteEintraege[relevanteEintraege.length - 1];
  return letzterEintrag.restschuldNachZahlung;
}
