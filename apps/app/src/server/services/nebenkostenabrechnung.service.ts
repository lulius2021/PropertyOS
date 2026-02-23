/**
 * Nebenkostenabrechnung Service
 * Berechnet Nebenkosten-Abrechnungen für Objekte
 */

import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Berechnet eine Nebenkostenabrechnung
 * Lädt alle BK-relevanten Kosten, verteilt sie nach Umlageschlüssel
 */
export async function berechneNebenkostenabrechnung(nkaId: string, tenantId: string) {
  const nka = await db.nebenkostenabrechnung.findUnique({
    where: { id: nkaId },
    include: {
      objekt: {
        include: { einheiten: true },
      },
    },
  });

  if (!nka || nka.tenantId !== tenantId) throw new Error("NKA nicht gefunden");

  // Alle BK/HK-relevanten Kosten im Abrechnungszeitraum laden
  const kosten = await db.kosten.findMany({
    where: {
      tenantId,
      objektId: nka.objektId,
      datum: { gte: nka.vonDatum, lte: nka.bisDatum },
      OR: [{ bkRelevant: true }, { hkRelevant: true }],
    },
  });

  if (kosten.length === 0) {
    throw new Error("Keine BK/HK-relevanten Kosten im Abrechnungszeitraum gefunden");
  }

  const einheiten = nka.objekt.einheiten;
  const gesamtFlaeche = einheiten.reduce((sum, e) => sum.plus(e.flaeche.toString()), new Decimal(0));
  const anzahlEinheiten = einheiten.length;

  // Aktive Mietverhältnisse im Zeitraum laden
  const mietverhaeltnisse = await db.mietverhaeltnis.findMany({
    where: {
      tenantId,
      einheit: { objektId: nka.objektId },
      einzugsdatum: { lte: nka.bisDatum },
      OR: [{ auszugsdatum: null }, { auszugsdatum: { gte: nka.vonDatum } }],
    },
    include: { einheit: true },
  });

  // Zeitraum in Tagen berechnen
  const abrechnungsTage = Math.ceil(
    (nka.bisDatum.getTime() - nka.vonDatum.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  // Bestehende Positionen löschen (bei Neuberechnung)
  await db.nKAPosition.deleteMany({ where: { nkaId } });
  await db.nKAMieterposition.deleteMany({ where: { nkaId } });

  let gesamtkosten = new Decimal(0);

  // Positionen erstellen
  for (const koste of kosten) {
    const betrag = new Decimal(koste.betragBrutto.toString());
    gesamtkosten = gesamtkosten.plus(betrag);

    // Umlageschlüssel bestimmen: Standard FLAECHE für BK, PAUSCHAL für HK
    const umlageschluessel = koste.hkRelevant ? "VERBRAUCH" : "FLAECHE";

    // Anteil pro Einheit berechnen
    const betragProEinheit: Record<string, string> = {};
    for (const einheit of einheiten) {
      let anteil: Decimal;
      if (umlageschluessel === "FLAECHE" && gesamtFlaeche.greaterThan(0)) {
        anteil = betrag.times(einheit.flaeche.toString()).dividedBy(gesamtFlaeche);
      } else {
        // VERBRAUCH / PAUSCHAL: gleichmäßig verteilen
        anteil = betrag.dividedBy(anzahlEinheiten);
      }
      betragProEinheit[einheit.id] = anteil.toDecimalPlaces(2).toString();
    }

    await db.nKAPosition.create({
      data: {
        nkaId,
        kostenartBezeichnung: koste.beschreibung || koste.kategorie,
        betragGesamt: betrag,
        umlageschluessel: "FLAECHE",
        bkRelevant: koste.bkRelevant,
        hkRelevant: koste.hkRelevant,
        betragProEinheit,
      },
    });
  }

  // Mieterpositionen berechnen
  for (const mv of mietverhaeltnisse) {
    // Anteilstage berechnen (für unterjährige Wechsel)
    const mvVon = mv.einzugsdatum > nka.vonDatum ? mv.einzugsdatum : nka.vonDatum;
    const mvBis = mv.auszugsdatum && mv.auszugsdatum < nka.bisDatum ? mv.auszugsdatum : nka.bisDatum;
    const anteilsTage = Math.ceil((mvBis.getTime() - mvVon.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const tagesAnteil = new Decimal(anteilsTage).dividedBy(abrechnungsTage);

    // Vorauszahlungen aus Sollstellungen berechnen
    const sollstellungen = await db.sollstellung.findMany({
      where: {
        tenantId,
        mietverhaeltnisId: mv.id,
        typ: { in: ["WARMMIETE", "NEBENKOSTEN"] },
        faelligkeitsdatum: { gte: nka.vonDatum, lte: nka.bisDatum },
        status: { in: ["BEZAHLT", "TEILWEISE_BEZAHLT"] },
      },
    });

    const vorauszahlungGesamt = sollstellungen.reduce((sum, s) => {
      const bk = new Decimal(s.bkVorauszahlung?.toString() || 0);
      const hk = new Decimal(s.hkVorauszahlung?.toString() || 0);
      return sum.plus(bk).plus(hk);
    }, new Decimal(0));

    // Ist-Kosten für diese Einheit berechnen (aus betragProEinheit)
    const positionen = await db.nKAPosition.findMany({ where: { nkaId } });
    let istKostenGesamt = new Decimal(0);
    for (const pos of positionen) {
      const anteilMap = (pos.betragProEinheit as Record<string, string>) || {};
      const anteil = anteilMap[mv.einheitId];
      if (anteil) {
        istKostenGesamt = istKostenGesamt.plus(new Decimal(anteil).times(tagesAnteil));
      }
    }

    const differenz = vorauszahlungGesamt.minus(istKostenGesamt);

    await db.nKAMieterposition.create({
      data: {
        nkaId,
        mietverhaeltnisId: mv.id,
        einheitId: mv.einheitId,
        vorauszahlungGesamt,
        istKostenGesamt: istKostenGesamt.toDecimalPlaces(2),
        differenz: differenz.toDecimalPlaces(2),
        anteilsTage,
      },
    });
  }

  // NKA aktualisieren
  await db.nebenkostenabrechnung.update({
    where: { id: nkaId },
    data: { status: "BERECHNET", gesamtkosten },
  });

  return { positionen: kosten.length, mieterpositionen: mietverhaeltnisse.length, gesamtkosten: gesamtkosten.toString() };
}
