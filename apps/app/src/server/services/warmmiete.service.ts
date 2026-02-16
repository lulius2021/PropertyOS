/**
 * Warmmiete Service
 * Handles creation of monthly rent charges (Sollstellungen)
 */

import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

interface CreateWarmmieteParams {
  mietverhaeltnisId: string;
  monat: Date; // Jahr und Monat für die Sollstellung
  tenantId: string;
}

/**
 * Erstellt eine monatliche Warmmiete-Sollstellung
 * Komponenten: Kaltmiete + BK-Vorauszahlung + HK-Vorauszahlung
 */
export async function erstelleMonatlicheWarmmiete({
  mietverhaeltnisId,
  monat,
  tenantId,
}: CreateWarmmieteParams) {
  // Mietverhältnis abrufen
  const mietverhaeltnis = await db.mietverhaeltnis.findUnique({
    where: { id: mietverhaeltnisId },
    include: {
      mieter: true,
      einheit: {
        include: {
          objekt: true,
        },
      },
    },
  });

  if (!mietverhaeltnis) {
    throw new Error("Mietverhältnis nicht gefunden");
  }

  if (mietverhaeltnis.tenantId !== tenantId) {
    throw new Error("Zugriff verweigert");
  }

  // Prüfen ob Mietverhältnis im Monat aktiv ist
  const monatStart = new Date(monat.getFullYear(), monat.getMonth(), 1);
  const monatEnde = new Date(monat.getFullYear(), monat.getMonth() + 1, 0);

  if (mietverhaeltnis.einzugsdatum > monatEnde) {
    throw new Error("Mietverhältnis ist in diesem Monat noch nicht aktiv");
  }

  if (
    mietverhaeltnis.auszugsdatum &&
    mietverhaeltnis.auszugsdatum < monatStart
  ) {
    throw new Error("Mietverhältnis ist in diesem Monat nicht mehr aktiv");
  }

  // Beträge
  const kaltmiete = mietverhaeltnis.kaltmiete;
  const bkVorauszahlung = mietverhaeltnis.bkVorauszahlung;
  const hkVorauszahlung = mietverhaeltnis.hkVorauszahlung;

  const betragGesamt = new Decimal(kaltmiete.toString())
    .plus(bkVorauszahlung.toString())
    .plus(hkVorauszahlung.toString());

  // Fälligkeitsdatum: 3. Werktag des Monats (vereinfacht: 3. Tag)
  const faelligkeitsdatum = new Date(
    monat.getFullYear(),
    monat.getMonth(),
    3
  );

  // Titel generieren
  const monatName = monat.toLocaleString("de-DE", {
    month: "long",
    year: "numeric",
  });
  const titel = `Warmmiete ${monatName} - ${mietverhaeltnis.einheit.objekt.bezeichnung} ${mietverhaeltnis.einheit.einheitNr}`;

  // Prüfen ob bereits eine Sollstellung für diesen Monat existiert
  const existierend = await db.sollstellung.findFirst({
    where: {
      tenantId,
      mietverhaeltnisId,
      typ: "WARMMIETE",
      faelligkeitsdatum: {
        gte: monatStart,
        lte: monatEnde,
      },
    },
  });

  if (existierend) {
    throw new Error("Warmmiete für diesen Monat wurde bereits erstellt");
  }

  // Sollstellung erstellen
  const sollstellung = await db.sollstellung.create({
    data: {
      tenantId,
      mietverhaeltnisId,
      typ: "WARMMIETE",
      titel,
      betragGesamt,
      kaltmiete,
      bkVorauszahlung,
      hkVorauszahlung,
      faelligkeitsdatum,
      status: "OFFEN",
    },
  });

  return sollstellung;
}

/**
 * Erstellt Warmmiete-Sollstellungen für alle aktiven Mietverhältnisse
 * Wird typischerweise monatlich per Cron ausgeführt
 */
export async function erstelleMonatlicheWarmmieteAlleVertraege(
  tenantId: string,
  monat: Date
) {
  // Alle aktiven Mietverhältnisse abrufen
  const monatStart = new Date(monat.getFullYear(), monat.getMonth(), 1);
  const monatEnde = new Date(monat.getFullYear(), monat.getMonth() + 1, 0);

  const aktiveMietverhaeltnisse = await db.mietverhaeltnis.findMany({
    where: {
      tenantId,
      einzugsdatum: {
        lte: monatEnde,
      },
      OR: [
        { auszugsdatum: null },
        { auszugsdatum: { gte: monatStart } },
      ],
    },
  });

  const ergebnisse = [];

  for (const mv of aktiveMietverhaeltnisse) {
    try {
      const sollstellung = await erstelleMonatlicheWarmmiete({
        mietverhaeltnisId: mv.id,
        monat,
        tenantId,
      });
      ergebnisse.push({ success: true, mietverhaeltnisId: mv.id, sollstellung });
    } catch (error) {
      ergebnisse.push({
        success: false,
        mietverhaeltnisId: mv.id,
        error: (error as Error).message,
      });
    }
  }

  return ergebnisse;
}
