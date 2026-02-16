/**
 * Deckungslogik Service
 * Handles payment allocation to Sollstellungen with priority logic
 * Priority: BK + HK first, then Kaltmiete
 */

import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { logAudit } from "../middleware/audit";

interface OrdneZahlungZuParams {
  zahlungId: string;
  sollstellungId: string;
  betrag: Decimal;
  tenantId: string;
  userId?: string;
}

/**
 * Ordnet eine Zahlung einer Sollstellung zu
 * Wendet Deckungspriorität an: BK+HK zuerst, dann Kalt
 */
export async function ordneZahlungZu({
  zahlungId,
  sollstellungId,
  betrag,
  tenantId,
  userId,
}: OrdneZahlungZuParams) {
  // Zahlung und Sollstellung abrufen
  const zahlung = await db.zahlung.findUnique({
    where: { id: zahlungId },
    include: { zuordnungen: true },
  });

  const sollstellung = await db.sollstellung.findUnique({
    where: { id: sollstellungId },
  });

  if (!zahlung || !sollstellung) {
    throw new Error("Zahlung oder Sollstellung nicht gefunden");
  }

  if (zahlung.tenantId !== tenantId || sollstellung.tenantId !== tenantId) {
    throw new Error("Zugriff verweigert");
  }

  // Prüfen ob genug Betrag in Zahlung verfügbar
  const bereitsZugeordnet = zahlung.zuordnungen.reduce(
    (sum, z) => sum.plus(z.betrag.toString()),
    new Decimal(0)
  );
  const verfuegbar = new Decimal(zahlung.betrag.toString()).minus(
    bereitsZugeordnet
  );

  if (betrag.greaterThan(verfuegbar)) {
    throw new Error(
      `Nicht genug Betrag verfügbar. Verfügbar: ${verfuegbar.toFixed(2)} EUR`
    );
  }

  // Offenen Betrag der Sollstellung berechnen
  const offen = new Decimal(sollstellung.betragGesamt.toString()).minus(
    sollstellung.gedecktGesamt.toString()
  );

  if (betrag.greaterThan(offen)) {
    throw new Error(
      `Betrag übersteigt offenen Posten. Offen: ${offen.toFixed(2)} EUR`
    );
  }

  // Deckungslogik anwenden
  let deckungBK = new Decimal(0);
  let deckungHK = new Decimal(0);
  let deckungKalt = new Decimal(0);

  if (sollstellung.typ === "WARMMIETE") {
    // WARMMIETE: Priorität BK+HK, dann Kalt
    const bkOffen = new Decimal(
      sollstellung.bkVorauszahlung?.toString() || 0
    ).minus(sollstellung.gedecktBK?.toString() || 0);
    const hkOffen = new Decimal(
      sollstellung.hkVorauszahlung?.toString() || 0
    ).minus(sollstellung.gedecktHK?.toString() || 0);
    const kaltOffen = new Decimal(
      sollstellung.kaltmiete?.toString() || 0
    ).minus(sollstellung.gedecktKalt?.toString() || 0);

    let verbleibt = betrag;

    // 1. BK decken
    if (verbleibt.greaterThan(0) && bkOffen.greaterThan(0)) {
      deckungBK = Decimal.min(verbleibt, bkOffen);
      verbleibt = verbleibt.minus(deckungBK);
    }

    // 2. HK decken
    if (verbleibt.greaterThan(0) && hkOffen.greaterThan(0)) {
      deckungHK = Decimal.min(verbleibt, hkOffen);
      verbleibt = verbleibt.minus(deckungHK);
    }

    // 3. Kalt decken
    if (verbleibt.greaterThan(0) && kaltOffen.greaterThan(0)) {
      deckungKalt = Decimal.min(verbleibt, kaltOffen);
      verbleibt = verbleibt.minus(deckungKalt);
    }

    if (verbleibt.greaterThan(0)) {
      throw new Error("Logikfehler: Betrag konnte nicht vollständig zugeordnet werden");
    }
  } else {
    // Andere Typen: Gesamtbetrag ohne Aufschlüsselung
    // Keine Komponenten-Deckung nötig
  }

  // Zuordnung erstellen
  const zuordnung = await db.zahlungZuordnung.create({
    data: {
      tenantId,
      zahlungId,
      sollstellungId,
      betrag,
      deckungKalt: deckungKalt.greaterThan(0) ? deckungKalt : null,
      deckungBK: deckungBK.greaterThan(0) ? deckungBK : null,
      deckungHK: deckungHK.greaterThan(0) ? deckungHK : null,
      zugeordnetVon: userId,
    },
  });

  // Sollstellung aktualisieren
  const neueGedecktGesamt = new Decimal(
    sollstellung.gedecktGesamt.toString()
  ).plus(betrag);
  const neueGedecktBK = new Decimal(
    sollstellung.gedecktBK?.toString() || 0
  ).plus(deckungBK);
  const neueGedecktHK = new Decimal(
    sollstellung.gedecktHK?.toString() || 0
  ).plus(deckungHK);
  const neueGedecktKalt = new Decimal(
    sollstellung.gedecktKalt?.toString() || 0
  ).plus(deckungKalt);

  // Neuen Status berechnen
  let neuerStatus = sollstellung.status;
  if (
    neueGedecktGesamt.greaterThanOrEqualTo(sollstellung.betragGesamt.toString())
  ) {
    neuerStatus = "BEZAHLT";
  } else if (neueGedecktGesamt.greaterThan(0)) {
    neuerStatus = "TEILWEISE_BEZAHLT";
  }

  await db.sollstellung.update({
    where: { id: sollstellungId },
    data: {
      gedecktGesamt: neueGedecktGesamt,
      gedecktBK: neueGedecktBK.greaterThan(0) ? neueGedecktBK : null,
      gedecktHK: neueGedecktHK.greaterThan(0) ? neueGedecktHK : null,
      gedecktKalt: neueGedecktKalt.greaterThan(0) ? neueGedecktKalt : null,
      status: neuerStatus,
    },
  });

  // Zahlungsstatus aktualisieren
  const neueZuordnungsSumme = bereitsZugeordnet.plus(betrag);
  let zahlungStatus = zahlung.status;
  if (
    neueZuordnungsSumme.greaterThanOrEqualTo(zahlung.betrag.toString())
  ) {
    zahlungStatus = "ZUGEORDNET";
  } else if (neueZuordnungsSumme.greaterThan(0)) {
    zahlungStatus = "TEILWEISE_ZUGEORDNET";
  }

  await db.zahlung.update({
    where: { id: zahlungId },
    data: {
      status: zahlungStatus,
      zugeordnetAm: new Date(),
    },
  });

  // Audit-Log
  await logAudit({
    tenantId,
    userId: userId || undefined,
    aktion: "ZAHLUNG_ZUGEORDNET",
    entitaet: "ZahlungZuordnung",
    entitaetId: zuordnung.id,
    neuWert: {
      zahlungId,
      sollstellungId,
      betrag: betrag.toString(),
      deckungBK: deckungBK.toString(),
      deckungHK: deckungHK.toString(),
      deckungKalt: deckungKalt.toString(),
    },
  });

  return zuordnung;
}

/**
 * Hebt eine Zahlungszuordnung auf (Revert)
 */
export async function hebeZuordnungAuf(zuordnungId: string, tenantId: string, userId?: string) {
  const zuordnung = await db.zahlungZuordnung.findUnique({
    where: { id: zuordnungId },
    include: {
      zahlung: true,
      sollstellung: true,
    },
  });

  if (!zuordnung) {
    throw new Error("Zuordnung nicht gefunden");
  }

  if (zuordnung.tenantId !== tenantId) {
    throw new Error("Zugriff verweigert");
  }

  // Sollstellung aktualisieren
  const neueGedecktGesamt = new Decimal(
    zuordnung.sollstellung.gedecktGesamt.toString()
  ).minus(zuordnung.betrag.toString());
  const neueGedecktBK = new Decimal(
    zuordnung.sollstellung.gedecktBK?.toString() || 0
  ).minus(zuordnung.deckungBK?.toString() || 0);
  const neueGedecktHK = new Decimal(
    zuordnung.sollstellung.gedecktHK?.toString() || 0
  ).minus(zuordnung.deckungHK?.toString() || 0);
  const neueGedecktKalt = new Decimal(
    zuordnung.sollstellung.gedecktKalt?.toString() || 0
  ).minus(zuordnung.deckungKalt?.toString() || 0);

  let neuerStatus = zuordnung.sollstellung.status;
  if (neueGedecktGesamt.lessThanOrEqualTo(0)) {
    neuerStatus = "OFFEN";
  } else if (
    neueGedecktGesamt.lessThan(zuordnung.sollstellung.betragGesamt.toString())
  ) {
    neuerStatus = "TEILWEISE_BEZAHLT";
  }

  await db.sollstellung.update({
    where: { id: zuordnung.sollstellungId },
    data: {
      gedecktGesamt: neueGedecktGesamt,
      gedecktBK: neueGedecktBK.greaterThan(0) ? neueGedecktBK : undefined,
      gedecktHK: neueGedecktHK.greaterThan(0) ? neueGedecktHK : undefined,
      gedecktKalt: neueGedecktKalt.greaterThan(0) ? neueGedecktKalt : undefined,
      status: neuerStatus,
    },
  });

  // Zahlung aktualisieren
  const alleZuordnungen = await db.zahlungZuordnung.findMany({
    where: {
      zahlungId: zuordnung.zahlungId,
      id: { not: zuordnungId },
    },
  });

  const verbleibendeZuordnung = alleZuordnungen.reduce(
    (sum, z) => sum.plus(z.betrag.toString()),
    new Decimal(0)
  );

  let zahlungStatus: "UNKLAR" | "ZUGEORDNET" | "TEILWEISE_ZUGEORDNET" | "IGNORIERT" | "SPLITTET" = "UNKLAR";
  if (verbleibendeZuordnung.greaterThanOrEqualTo(zuordnung.zahlung.betrag.toString())) {
    zahlungStatus = "ZUGEORDNET";
  } else if (verbleibendeZuordnung.greaterThan(0)) {
    zahlungStatus = "TEILWEISE_ZUGEORDNET";
  }

  await db.zahlung.update({
    where: { id: zuordnung.zahlungId },
    data: { status: zahlungStatus },
  });

  // Zuordnung löschen
  await db.zahlungZuordnung.delete({
    where: { id: zuordnungId },
  });

  // Audit-Log
  await logAudit({
    tenantId,
    userId: userId || undefined,
    aktion: "ZAHLUNG_ZUORDNUNG_AUFGEHOBEN",
    entitaet: "ZahlungZuordnung",
    entitaetId: zuordnungId,
    altWert: {
      zahlungId: zuordnung.zahlungId,
      sollstellungId: zuordnung.sollstellungId,
      betrag: zuordnung.betrag.toString(),
    },
  });

  return true;
}
