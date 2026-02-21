import { WidgetDefinition } from "./types";

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: "objekte",
    name: "Objekte",
    description: "Verwaltete Liegenschaften",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "einheiten",
    name: "Einheiten",
    description: "Wohneinheiten gesamt",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "rueckstaende",
    name: "Offene Rückstände",
    description: "Fällige Zahlungen",
    color: "text-orange-600",
    bg: "bg-orange-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "tickets",
    name: "Offene Tickets",
    description: "Zu bearbeitende Meldungen",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "vermietungsquote",
    name: "Vermietungsquote",
    description: "Auslastung der Einheiten",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "handlungsbedarf",
    name: "Handlungsbedarf",
    description: "Unklare Zahlungen",
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },
  {
    type: "schnellzugriff",
    name: "Schnellzugriff",
    description: "Häufig genutzte Bereiche",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
    sizes: {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 3 },
      large: { w: 12, h: 3 },
    },
  },

  // ───────────────────────────────────────────────────────
  // A) Vermietung
  // ───────────────────────────────────────────────────────
  {
    type: "belegungsquote",
    name: "Belegungsquote",
    description: "Anteil vermieteter Einheiten",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "leerstandsquote",
    name: "Leerstandsquote",
    description: "Anteil leerstehender Einheiten",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "leerstandsdauer",
    name: "Leerstandsdauer",
    description: "Durchschnittliche Dauer des Leerstands",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "fluktuationsquote",
    name: "Fluktuationsquote",
    description: "Mieterwechsel pro Jahr",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "ertragsverlustLeerstand",
    name: "Ertragsverlust Leerstand",
    description: "Entgangene Mieteinnahmen durch Leerstand",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // B) Soll/Ist
  // ───────────────────────────────────────────────────────
  {
    type: "sollstellungen",
    name: "Sollstellungen",
    description: "Monatliche Soll-Mieten gesamt",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "istzahlungen",
    name: "Ist-Zahlungen",
    description: "Tatsächlich eingegangene Zahlungen",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "einzugsquote",
    name: "Einzugsquote",
    description: "Anteil eingezogener Mieten am Soll",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "mietrueckstaende",
    name: "Mietrückstände",
    description: "Offene Mietrückstände gesamt",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "agingRueckstaende",
    name: "Aging Rückstände",
    description: "Rückstände nach Alter aufgeschlüsselt",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 2, h: 4 }, large: { w: 4, h: 4 } },
  },
  {
    type: "zahlungsverzug",
    name: "Zahlungsverzug",
    description: "Durchschnittliche Verzugstage",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // C) Cashflow
  // ───────────────────────────────────────────────────────
  {
    type: "operativerCashflow",
    name: "Operativer Cashflow",
    description: "Einnahmen abzüglich Betriebskosten",
    color: "text-teal-600",
    bg: "bg-teal-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "cashflowNachDebt",
    name: "Cashflow nach Kapitaldienst",
    description: "Cashflow nach Zins und Tilgung",
    color: "text-teal-600",
    bg: "bg-teal-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "debtService",
    name: "Kapitaldienst",
    description: "Monatliche Zins- und Tilgungsleistung",
    color: "text-teal-600",
    bg: "bg-teal-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // D) Finanzierung
  // ───────────────────────────────────────────────────────
  {
    type: "restschuld",
    name: "Restschuld",
    description: "Gesamte offene Kreditschuld",
    color: "text-violet-600",
    bg: "bg-violet-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "dscr",
    name: "DSCR",
    description: "Schuldendienstdeckungsgrad",
    color: "text-violet-600",
    bg: "bg-violet-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "kredituebersicht",
    name: "Kreditübersicht",
    description: "Alle Kredite im Überblick",
    color: "text-violet-600",
    bg: "bg-violet-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 2, h: 4 }, large: { w: 4, h: 4 } },
  },

  // ───────────────────────────────────────────────────────
  // E) Kosten
  // ───────────────────────────────────────────────────────
  {
    type: "kostenGesamt",
    name: "Gesamtkosten",
    description: "Alle Betriebskosten im Überblick",
    color: "text-rose-600",
    bg: "bg-rose-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "kostenProQm",
    name: "Kosten pro m\u00B2",
    description: "Durchschnittliche Kosten je Quadratmeter",
    color: "text-rose-600",
    bg: "bg-rose-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "kostenNachKategorie",
    name: "Kosten nach Kategorie",
    description: "Kostenaufschlüsselung nach Kategorien",
    color: "text-rose-600",
    bg: "bg-rose-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 2, h: 4 }, large: { w: 4, h: 4 } },
  },

  // ───────────────────────────────────────────────────────
  // F) Tickets
  // ───────────────────────────────────────────────────────
  {
    type: "ticketsPrioritaet",
    name: "Tickets nach Priorität",
    description: "Ticketverteilung nach Dringlichkeit",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "ticketBearbeitungszeit",
    name: "Bearbeitungszeit",
    description: "Durchschnittliche Ticket-Bearbeitungszeit",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "ticketKategorien",
    name: "Ticket-Kategorien",
    description: "Häufigste Ticketkategorien",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 2, h: 4 }, large: { w: 4, h: 4 } },
  },

  // ───────────────────────────────────────────────────────
  // I) Zaehler
  // ───────────────────────────────────────────────────────
  {
    type: "zaehlerVollstaendigkeit",
    name: "Zähler-Vollständigkeit",
    description: "Anteil Zähler mit aktueller Ablesung",
    color: "text-cyan-600",
    bg: "bg-cyan-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // J) Miete
  // ───────────────────────────────────────────────────────
  {
    type: "kaltmieteProQm",
    name: "Kaltmiete pro m\u00B2",
    description: "Durchschnittliche Kaltmiete je Quadratmeter",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "gesamtMiete",
    name: "Gesamtmiete",
    description: "Monatliche Mieteinnahmen gesamt",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // K) Datenqualitaet
  // ───────────────────────────────────────────────────────
  {
    type: "unzugeordneteZahlungen",
    name: "Unzugeordnete Zahlungen",
    description: "Zahlungen ohne Zuordnung",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },
  {
    type: "stammdatenLuecken",
    name: "Stammdaten-Lücken",
    description: "Fehlende Stammdaten im System",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    sizes: { small: { w: 1, h: 2 }, medium: { w: 2, h: 3 }, large: { w: 4, h: 3 } },
  },

  // ───────────────────────────────────────────────────────
  // Zeitverlauf-Charts
  // ───────────────────────────────────────────────────────
  {
    type: "sollIstVerlauf",
    name: "Soll/Ist Verlauf",
    description: "Monatlicher Soll/Ist-Vergleich als Balkendiagramm",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 3, h: 3 }, large: { w: 4, h: 4 } },
  },
  {
    type: "cashflowVerlauf",
    name: "Cashflow Verlauf",
    description: "Monatlicher Cashflow als Liniendiagramm",
    color: "text-teal-600",
    bg: "bg-teal-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 3, h: 3 }, large: { w: 4, h: 4 } },
  },
  {
    type: "kostenVerlauf",
    name: "Kosten Verlauf",
    description: "Monatliche Kosten als gestapeltes Balkendiagramm",
    color: "text-rose-600",
    bg: "bg-rose-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 3, h: 3 }, large: { w: 4, h: 4 } },
  },
  {
    type: "ticketsVerlauf",
    name: "Tickets Verlauf",
    description: "Monatliche Tickets als Liniendiagramm",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    sizes: { small: { w: 2, h: 3 }, medium: { w: 3, h: 3 }, large: { w: 4, h: 4 } },
  },
];
