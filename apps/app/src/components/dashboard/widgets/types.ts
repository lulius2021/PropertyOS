export type WidgetSize = "small" | "medium" | "large";

export type WidgetType =
  | "objekte"
  | "einheiten"
  | "rueckstaende"
  | "tickets"
  | "vermietungsquote"
  | "handlungsbedarf"
  | "schnellzugriff";

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
