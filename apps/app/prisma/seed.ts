import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { id: "demo-tenant-1" },
    update: {},
    create: {
      id: "demo-tenant-1",
      name: "Demo Hausverwaltung GmbH",
    },
  });

  console.log("✅ Created tenant:", demoTenant.name);

  // Create demo users
  const users = [
    {
      id: "user-admin",
      email: "admin@demo.de",
      password: "demo1234",
      name: "Admin User",
      role: "ADMIN" as const,
    },
    {
      id: "user-sachbearbeiter",
      email: "user@demo.de",
      password: "demo1234",
      name: "Test User",
      role: "SACHBEARBEITER" as const,
    },
    {
      id: "user-readonly",
      email: "readonly@demo.de",
      password: "demo1234",
      name: "Read Only User",
      role: "READONLY" as const,
    },
  ];

  for (const userData of users) {
    const passwordHash = await hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: demoTenant.id,
          email: userData.email,
        },
      },
      update: {},
      create: {
        id: userData.id,
        tenantId: demoTenant.id,
        email: userData.email,
        passwordHash,
        name: userData.name,
        role: userData.role,
      },
    });

    console.log(`✅ Created user: ${user.email} (${user.role})`);
  }

  // Create demo objects
  const objekte = [
    {
      id: "obj-1",
      bezeichnung: "Musterstraße 10",
      strasse: "Musterstraße 10",
      plz: "10115",
      ort: "Berlin",
      objektart: "WOHNHAUS" as const,
      gesamtflaeche: new Decimal("450.00"),
    },
    {
      id: "obj-2",
      bezeichnung: "Hauptplatz 5",
      strasse: "Hauptplatz 5",
      plz: "80331",
      ort: "München",
      objektart: "GEMISCHT" as const,
      gesamtflaeche: new Decimal("800.00"),
    },
    {
      id: "obj-3",
      bezeichnung: "Gewerbepark Nord",
      strasse: "Industriestraße 42",
      plz: "60311",
      ort: "Frankfurt",
      objektart: "GEWERBE" as const,
      gesamtflaeche: new Decimal("1200.00"),
    },
  ];

  for (const obj of objekte) {
    await prisma.objekt.upsert({
      where: { id: obj.id },
      update: {},
      create: { ...obj, tenantId: demoTenant.id },
    });
    console.log(`✅ Created objekt: ${obj.bezeichnung}`);
  }

  // Create demo einheiten
  const einheiten = [
    // Musterstraße 10
    {
      id: "ein-1",
      objektId: "obj-1",
      einheitNr: "01",
      typ: "WOHNUNG" as const,
      flaeche: new Decimal("75.00"),
      zimmer: 3,
      etage: 0,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("12.50"),
    },
    {
      id: "ein-2",
      objektId: "obj-1",
      einheitNr: "02",
      typ: "WOHNUNG" as const,
      flaeche: new Decimal("65.00"),
      zimmer: 2,
      etage: 1,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("13.00"),
    },
    {
      id: "ein-3",
      objektId: "obj-1",
      einheitNr: "03",
      typ: "WOHNUNG" as const,
      flaeche: new Decimal("85.00"),
      zimmer: 4,
      etage: 2,
      status: "VERFUEGBAR" as const,
      eurProQm: new Decimal("12.00"),
    },
    // Hauptplatz 5
    {
      id: "ein-4",
      objektId: "obj-2",
      einheitNr: "EG-L",
      typ: "GEWERBE" as const,
      flaeche: new Decimal("120.00"),
      zimmer: null,
      etage: 0,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("18.00"),
    },
    {
      id: "ein-5",
      objektId: "obj-2",
      einheitNr: "01",
      typ: "WOHNUNG" as const,
      flaeche: new Decimal("90.00"),
      zimmer: 3,
      etage: 1,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("14.50"),
    },
    {
      id: "ein-6",
      objektId: "obj-2",
      einheitNr: "02",
      typ: "WOHNUNG" as const,
      flaeche: new Decimal("55.00"),
      zimmer: 2,
      etage: 2,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("15.00"),
    },
    // Gewerbepark Nord
    {
      id: "ein-7",
      objektId: "obj-3",
      einheitNr: "H1",
      typ: "LAGER" as const,
      flaeche: new Decimal("300.00"),
      zimmer: null,
      etage: 0,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("8.00"),
    },
    {
      id: "ein-8",
      objektId: "obj-3",
      einheitNr: "H2",
      typ: "LAGER" as const,
      flaeche: new Decimal("250.00"),
      zimmer: null,
      etage: 0,
      status: "VERFUEGBAR" as const,
      eurProQm: new Decimal("7.50"),
    },
    {
      id: "ein-9",
      objektId: "obj-3",
      einheitNr: "ST-01",
      typ: "STELLPLATZ" as const,
      flaeche: new Decimal("12.50"),
      zimmer: null,
      etage: 0,
      status: "VERMIETET" as const,
      eurProQm: new Decimal("4.00"),
    },
    {
      id: "ein-10",
      objektId: "obj-3",
      einheitNr: "ST-02",
      typ: "STELLPLATZ" as const,
      flaeche: new Decimal("12.50"),
      zimmer: null,
      etage: 0,
      status: "VERFUEGBAR" as const,
      eurProQm: new Decimal("4.00"),
    },
  ];

  for (const ein of einheiten) {
    await prisma.einheit.upsert({
      where: { id: ein.id },
      update: {},
      create: { ...ein, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${einheiten.length} einheiten`);

  // Create demo mieter
  const mieter = [
    {
      id: "miet-1",
      typ: "PRIVAT" as const,
      vorname: "Max",
      nachname: "Mustermann",
      strasse: "Testweg 1",
      plz: "12345",
      ort: "Berlin",
      email: "max@example.com",
      telefon: "+49 30 12345678",
    },
    {
      id: "miet-2",
      typ: "PRIVAT" as const,
      vorname: "Anna",
      nachname: "Schmidt",
      email: "anna.schmidt@example.com",
    },
    {
      id: "miet-3",
      typ: "GEWERBE" as const,
      firma: "Café Sonnenschein GmbH",
      nachname: "Café Sonnenschein",
      email: "info@sonnenschein.de",
    },
    {
      id: "miet-4",
      typ: "PRIVAT" as const,
      vorname: "Thomas",
      nachname: "Weber",
      email: "t.weber@example.com",
    },
    {
      id: "miet-5",
      typ: "PRIVAT" as const,
      vorname: "Lisa",
      nachname: "Müller",
      email: "lisa.mueller@example.com",
    },
    {
      id: "miet-6",
      typ: "GEWERBE" as const,
      firma: "Logistik Express AG",
      nachname: "Logistik Express",
      email: "kontakt@logistik-express.de",
    },
    {
      id: "miet-7",
      typ: "PRIVAT" as const,
      vorname: "Peter",
      nachname: "Schneider",
      email: "p.schneider@example.com",
    },
    {
      id: "miet-8",
      typ: "PRIVAT" as const,
      vorname: "Julia",
      nachname: "Koch",
      email: "julia.koch@example.com",
    },
  ];

  for (const m of mieter) {
    await prisma.mieter.upsert({
      where: { id: m.id },
      update: {},
      create: { ...m, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${mieter.length} mieter`);

  // Create demo mietverhaeltnisse
  const mietverhaeltnisse = [
    {
      id: "mv-1",
      mieterId: "miet-1",
      einheitId: "ein-1",
      einzugsdatum: new Date("2022-01-01"),
      kaltmiete: new Decimal("937.50"),
      bkVorauszahlung: new Decimal("150.00"),
      hkVorauszahlung: new Decimal("100.00"),
      kaution: new Decimal("2812.50"),
      kautionStatus: "VOLLSTAENDIG" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-2",
      mieterId: "miet-2",
      einheitId: "ein-2",
      einzugsdatum: new Date("2023-03-15"),
      kaltmiete: new Decimal("845.00"),
      bkVorauszahlung: new Decimal("130.00"),
      hkVorauszahlung: new Decimal("90.00"),
      kaution: new Decimal("2535.00"),
      kautionStatus: "VOLLSTAENDIG" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-3",
      mieterId: "miet-3",
      einheitId: "ein-4",
      einzugsdatum: new Date("2021-06-01"),
      kaltmiete: new Decimal("2160.00"),
      bkVorauszahlung: new Decimal("300.00"),
      hkVorauszahlung: new Decimal("250.00"),
      kaution: new Decimal("6480.00"),
      kautionStatus: "HINTERLEGT_BANK" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-4",
      mieterId: "miet-4",
      einheitId: "ein-5",
      einzugsdatum: new Date("2024-01-01"),
      kaltmiete: new Decimal("1305.00"),
      bkVorauszahlung: new Decimal("180.00"),
      hkVorauszahlung: new Decimal("120.00"),
      kaution: new Decimal("3915.00"),
      kautionStatus: "VOLLSTAENDIG" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-5",
      mieterId: "miet-5",
      einheitId: "ein-6",
      einzugsdatum: new Date("2023-09-01"),
      kaltmiete: new Decimal("825.00"),
      bkVorauszahlung: new Decimal("110.00"),
      hkVorauszahlung: new Decimal("80.00"),
      kaution: new Decimal("2475.00"),
      kautionStatus: "VOLLSTAENDIG" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-6",
      mieterId: "miet-6",
      einheitId: "ein-7",
      einzugsdatum: new Date("2022-08-01"),
      kaltmiete: new Decimal("2400.00"),
      bkVorauszahlung: new Decimal("200.00"),
      hkVorauszahlung: new Decimal("150.00"),
      kaution: new Decimal("7200.00"),
      kautionStatus: "HINTERLEGT_BANK" as const,
      vertragStatus: "AKTIV" as const,
    },
    {
      id: "mv-7",
      mieterId: "miet-7",
      einheitId: "ein-9",
      einzugsdatum: new Date("2024-02-01"),
      kaltmiete: new Decimal("50.00"),
      bkVorauszahlung: new Decimal("0.00"),
      hkVorauszahlung: new Decimal("0.00"),
      kaution: new Decimal("0.00"),
      kautionStatus: "AUSSTEHEND" as const,
      vertragStatus: "AKTIV" as const,
    },
  ];

  for (const mv of mietverhaeltnisse) {
    await prisma.mietverhaeltnis.upsert({
      where: { id: mv.id },
      update: {},
      create: { ...mv, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${mietverhaeltnisse.length} mietverhaeltnisse`);

  // Create sollstellungen (last 3 months)
  console.log("Creating sollstellungen for last 3 months...");
  const now = new Date();
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const monat = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const faelligkeitsdatum = new Date(
      monat.getFullYear(),
      monat.getMonth(),
      3
    ); // 3rd of month

    for (const mv of mietverhaeltnisse) {
      if (mv.einzugsdatum <= monat) {
        const betragGesamt = new Decimal(mv.kaltmiete.toString())
          .plus(mv.bkVorauszahlung.toString())
          .plus(mv.hkVorauszahlung.toString());

        await prisma.sollstellung.create({
          data: {
            tenantId: demoTenant.id,
            mietverhaeltnisId: mv.id,
            typ: "WARMMIETE",
            titel: `Warmmiete ${monat.toISOString().substring(0, 7)}`,
            betragGesamt,
            kaltmiete: mv.kaltmiete,
            bkVorauszahlung: mv.bkVorauszahlung,
            hkVorauszahlung: mv.hkVorauszahlung,
            faelligkeitsdatum,
            status: monthOffset === 0 ? "OFFEN" : "BEZAHLT",
            gedecktGesamt:
              monthOffset === 0 ? new Decimal(0) : betragGesamt,
            gedecktKalt:
              monthOffset === 0 ? new Decimal(0) : mv.kaltmiete,
            gedecktBK:
              monthOffset === 0 ? new Decimal(0) : mv.bkVorauszahlung,
            gedecktHK:
              monthOffset === 0 ? new Decimal(0) : mv.hkVorauszahlung,
          },
        });
      }
    }
  }
  console.log("✅ Created sollstellungen");

  // Create some zahlungen (some unklar, some zugeordnet)
  const zahlungen = [
    {
      id: "zahl-1",
      datum: new Date(now.getFullYear(), now.getMonth(), 5),
      betrag: new Decimal("1187.50"),
      verwendungszweck: "Miete Einheit 01 Mustermann",
      iban: "DE89370400440532013000",
      status: "UNKLAR" as const,
    },
    {
      id: "zahl-2",
      datum: new Date(now.getFullYear(), now.getMonth(), 7),
      betrag: new Decimal("500.00"),
      verwendungszweck: "Teilzahlung",
      status: "UNKLAR" as const,
    },
    {
      id: "zahl-3",
      datum: new Date(now.getFullYear(), now.getMonth() - 1, 4),
      betrag: new Decimal("1065.00"),
      verwendungszweck: "Miete Schmidt",
      status: "ZUGEORDNET" as const,
    },
  ];

  for (const z of zahlungen) {
    await prisma.zahlung.upsert({
      where: { id: z.id },
      update: {},
      create: { ...z, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${zahlungen.length} zahlungen`);

  // Create tickets
  const tickets = [
    {
      id: "tick-1",
      titel: "Heizung ausgefallen",
      beschreibung: "Die Heizung in Einheit 01 funktioniert nicht mehr.",
      kategorie: "SCHADENSMELDUNG" as const,
      prioritaet: "KRITISCH" as const,
      status: "IN_BEARBEITUNG" as const,
    },
    {
      id: "tick-2",
      titel: "Wasserhahn tropft",
      beschreibung: "Küche Einheit 02",
      kategorie: "SCHADENSMELDUNG" as const,
      prioritaet: "MITTEL" as const,
      status: "ERFASST" as const,
    },
    {
      id: "tick-3",
      titel: "Jährliche Wartung Heizung",
      beschreibung: "Wartungsvertrag mit Firma Müller",
      kategorie: "WARTUNG" as const,
      prioritaet: "NIEDRIG" as const,
      status: "ERFASST" as const,
    },
    {
      id: "tick-4",
      titel: "Parkplatz Anfrage",
      beschreibung: "Mieter fragt nach zusätzlichem Stellplatz",
      kategorie: "ANFRAGE" as const,
      prioritaet: "NIEDRIG" as const,
      status: "ZUR_PRUEFUNG" as const,
    },
    {
      id: "tick-5",
      titel: "Lärmbelästigung",
      beschreibung: "Beschwerde über Lärm von Nachbarn",
      kategorie: "BESCHWERDE" as const,
      prioritaet: "MITTEL" as const,
      status: "ABGESCHLOSSEN" as const,
    },
  ];

  for (const t of tickets) {
    await prisma.ticket.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${tickets.length} tickets`);

  // Create kosten
  const kosten = [
    {
      datum: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      betragBrutto: new Decimal("1250.00"),
      lieferant: "Heizungswartung Müller GmbH",
      kategorie: "Wartung",
      bkRelevant: true,
      hkRelevant: true,
      jahr: now.getFullYear(),
    },
    {
      datum: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      betragBrutto: new Decimal("450.00"),
      lieferant: "Reinigungsdienst Schmidt",
      kategorie: "Hausreinigung",
      bkRelevant: true,
      hkRelevant: false,
      jahr: now.getFullYear(),
    },
    {
      datum: new Date(now.getFullYear(), now.getMonth(), 15),
      betragBrutto: new Decimal("320.00"),
      lieferant: "Gartenpflege Weber",
      kategorie: "Außenanlagen",
      beschreibung: "Rasenmähen und Heckenschnitt",
      bkRelevant: true,
      hkRelevant: false,
      jahr: now.getFullYear(),
    },
  ];

  for (const k of kosten) {
    await prisma.kosten.create({
      data: { ...k, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${kosten.length} kosten`);

  // Create zaehler
  const zaehler = [
    {
      id: "z-1",
      zaehlernummer: "STROM-001",
      typ: "STROM" as const,
      einheitId: "ein-1",
    },
    {
      id: "z-2",
      zaehlernummer: "GAS-OBJ1",
      typ: "GAS" as const,
      objektId: "obj-1",
    },
    {
      id: "z-3",
      zaehlernummer: "WASSER-OBJ1",
      typ: "WASSER_KALT" as const,
      objektId: "obj-1",
    },
  ];

  for (const z of zaehler) {
    await prisma.zaehler.upsert({
      where: { id: z.id },
      update: {},
      create: { ...z, tenantId: demoTenant.id },
    });
  }
  console.log(`✅ Created ${zaehler.length} zaehler`);

  console.log("\n🎉 Seeding completed!");
  console.log("\nDemo credentials:");
  console.log("  Email: admin@demo.de");
  console.log("  Password: demo1234");
  console.log("\nOther users:");
  console.log("  user@demo.de (Sachbearbeiter)");
  console.log("  readonly@demo.de (Read-only)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
