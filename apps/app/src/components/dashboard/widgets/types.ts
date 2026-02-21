export type WidgetSize = "small" | "medium" | "large";

export type WidgetType =
  | "objekte"
  | "einheiten"
  | "rueckstaende"
  | "tickets"
  | "vermietungsquote"
  | "handlungsbedarf"
  | "schnellzugriff"
  // A) Vermietung
  | "belegungsquote"
  | "leerstandsquote"
  | "leerstandsdauer"
  | "fluktuationsquote"
  | "ertragsverlustLeerstand"
  // B) Soll/Ist
  | "sollstellungen"
  | "istzahlungen"
  | "einzugsquote"
  | "mietrueckstaende"
  | "agingRueckstaende"
  | "zahlungsverzug"
  // C) Cashflow
  | "operativerCashflow"
  | "cashflowNachDebt"
  | "debtService"
  // D) Finanzierung
  | "restschuld"
  | "dscr"
  | "kredituebersicht"
  // E) Kosten
  | "kostenGesamt"
  | "kostenProQm"
  | "kostenNachKategorie"
  // F) Tickets
  | "ticketsPrioritaet"
  | "ticketBearbeitungszeit"
  | "ticketKategorien"
  // I) Zaehler
  | "zaehlerVollstaendigkeit"
  // J) Miete
  | "kaltmieteProQm"
  | "gesamtMiete"
  // K) Datenqualitaet
  | "unzugeordneteZahlungen"
  | "stammdatenLuecken"
  // Zeitverlauf-Charts
  | "sollIstVerlauf"
  | "cashflowVerlauf"
  | "kostenVerlauf"
  | "ticketsVerlauf";

export interface WidgetConfig {
  i: string; // unique id
  type: WidgetType;
  size: WidgetSize;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  sizes: {
    small: { w: number; h: number };
    medium: { w: number; h: number };
    large: { w: number; h: number };
  };
}
