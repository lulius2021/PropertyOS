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

export type PlanName = "starter" | "plus" | "pro" | "unlimited";

export interface PlanLimits {
  maxObjekte: number;
  features: PlanFeature[];
  label: string;
  priceMonthly: number; // EUR
  priceAnnual: number;  // EUR per month (annual billing)
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  starter: {
    maxObjekte: 5,
    features: ["basis"],
    label: "Starter",
    priceMonthly: 9.99,
    priceAnnual: 8.99,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? "",
  },
  plus: {
    maxObjekte: 20,
    features: ["basis", "tickets", "bankImport", "dokumente", "export"],
    label: "Plus",
    priceMonthly: 29.99,
    priceAnnual: 26.99,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PLUS_MONTHLY ?? "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PLUS_ANNUAL ?? "",
  },
  pro: {
    maxObjekte: 60,
    features: ["basis", "tickets", "bankImport", "dokumente", "export"],
    label: "Pro",
    priceMonthly: 79.99,
    priceAnnual: 71.99,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
  },
  unlimited: {
    maxObjekte: Infinity,
    features: ["basis", "tickets", "bankImport", "dokumente", "export", "multiUser", "api"],
    label: "Unlimited",
    priceMonthly: 149.0,
    priceAnnual: 134.1,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_UNLIMITED_MONTHLY ?? "",
    stripePriceIdAnnual: process.env.STRIPE_PRICE_UNLIMITED_ANNUAL ?? "",
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
      return "plus";
    case "plus":
      return "pro";
    case "pro":
      return "unlimited";
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

/**
 * Berechnet den monatlichen Äquivalentpreis für den Referral-Kredit
 */
export function getReferralCreditAmount(plan: PlanName, interval: "monthly" | "annual"): number {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return 0;
  if (interval === "annual") {
    return limits.priceAnnual * 2;
  }
  return limits.priceMonthly;
}
