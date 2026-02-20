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
];
