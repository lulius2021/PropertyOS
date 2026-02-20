/**
 * Plan-Definitionen & Limits
 * Zentrale Konfiguration der Subscription-Pläne
 */

export type PlanFeature =
  | "basis"
  | "tickets"
  | "bankImport"
  | "dokumente"
  | "export"
  | "multiUser"
  | "api";

export type PlanName = "starter" | "professional" | "enterprise";

export interface PlanLimits {
  maxObjekte: number;
  features: PlanFeature[];
  label: string;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  starter: {
    maxObjekte: 5,
    features: ["basis"],
    label: "Starter",
  },
  professional: {
    maxObjekte: Infinity,
    features: ["basis", "tickets", "bankImport", "dokumente", "export"],
    label: "Professional",
  },
  enterprise: {
    maxObjekte: Infinity,
    features: ["basis", "tickets", "bankImport", "dokumente", "export", "multiUser", "api"],
    label: "Enterprise",
  },
};

/**
 * Prüft ob ein Plan ein bestimmtes Feature enthält
 */
export function planHasFeature(plan: string, feature: PlanFeature): boolean {
  const limits = PLAN_LIMITS[plan as PlanName];
  if (!limits) return false;
  return limits.features.includes(feature);
}

/**
 * Gibt das Objekt-Limit für einen Plan zurück
 */
export function getMaxObjekte(plan: string): number {
  const limits = PLAN_LIMITS[plan as PlanName];
  if (!limits) return 0;
  return limits.maxObjekte;
}

/**
 * Gibt den nächsthöheren Plan zurück (für Upgrade-Hinweise)
 */
export function getUpgradePlan(currentPlan: string): PlanName | null {
  switch (currentPlan) {
    case "starter":
      return "professional";
    case "professional":
      return "enterprise";
    default:
      return null;
  }
}

/**
 * Menschenlesbare Feature-Namen (für Fehlermeldungen)
 */
export const FEATURE_LABELS: Record<PlanFeature, string> = {
  basis: "Grundfunktionen",
  tickets: "Ticketsystem",
  bankImport: "Bankimport & CSV",
  dokumente: "Dokumentenverwaltung",
  export: "Datenexport",
  multiUser: "Multi-User",
  api: "API-Zugriff",
};
