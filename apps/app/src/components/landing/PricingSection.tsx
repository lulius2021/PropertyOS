"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    id: "starter",
    name: "Starter",
    limit: "bis 5 Objekte",
    priceMonthly: "9,99",
    priceAnnual: "8,99",
    description: "Für Einsteiger und kleine Portfolios.",
    featured: false,
    href: "/register?plan=starter",
    features: [
      "Bis zu 5 Objekte & Einheiten",
      "Mieterverwaltung & Verträge",
      "Zahlungs-Tracking & Mahnwesen",
      "Zählerverwaltung",
      "Dashboard & KPIs",
    ],
    missing: ["Ticketsystem", "CSV-Bankimport", "Dokumentenverwaltung", "Multi-User"],
  },
  {
    id: "plus",
    name: "Plus",
    limit: "bis 20 Objekte",
    priceMonthly: "29,99",
    priceAnnual: "26,99",
    description: "Für wachsende Portfolios.",
    featured: false,
    href: "/register?plan=plus",
    features: [
      "Bis zu 20 Objekte & Einheiten",
      "Alle Starter-Features",
      "Ticketsystem",
      "CSV-Bankimport & Auto-Matching",
      "Dokumentenverwaltung",
      "Datenexport (CSV / Excel)",
    ],
    missing: ["Multi-User", "API-Zugriff"],
  },
  {
    id: "pro",
    name: "Pro",
    limit: "bis 60 Objekte",
    priceMonthly: "79,99",
    priceAnnual: "71,99",
    description: "Für professionelle Verwalter.",
    featured: true,
    badge: "Empfohlen",
    href: "/register?plan=pro",
    features: [
      "Bis zu 60 Objekte & Einheiten",
      "Alle Plus-Features",
      "Priority-Support",
    ],
    missing: ["Multi-User", "API-Zugriff"],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    limit: "Unbegrenzt",
    priceMonthly: "149,00",
    priceAnnual: "134,10",
    description: "Für große Verwaltungsunternehmen.",
    featured: false,
    href: "/register?plan=unlimited",
    features: [
      "Unbegrenzt Objekte & Einheiten",
      "Alle Pro-Features",
      "Multi-User (unbegrenzt)",
      "Rollenbasierte Zugriffsrechte",
      "API-Zugriff",
      "Dedizierter Account-Manager",
    ],
    missing: [],
  },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section style={{ background: "#ffffff", padding: "5rem 1.5rem" }} id="preise">
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div data-animate style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0066ff", marginBottom: "0.75rem" }}>
            Preise
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#0f0f1a", marginBottom: "0.75rem", lineHeight: 1.15 }}>
            Transparent und fair
          </h2>
          <p style={{ fontSize: "1.0625rem", color: "#5a6478" }}>
            30 Tage kostenlos testen — keine Kreditkarte erforderlich.
          </p>
        </div>

        {/* Trial Banner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", background: "rgba(0,102,255,0.06)", border: "1px solid rgba(0,102,255,0.15)", color: "#1a3a6b", fontSize: "0.9375rem", padding: "0.75rem 1.5rem", borderRadius: 10, marginBottom: "2rem", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span><strong>30 Tage Free Trial</strong> — Alle Features testen, kein Upgrade nötig, kein Risiko.</span>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 10, padding: 4, gap: 2 }}>
            <button
              onClick={() => setAnnual(false)}
              style={{ padding: "0.5rem 1.125rem", borderRadius: 7, border: "none", background: annual ? "transparent" : "#ffffff", color: annual ? "#6b7280" : "#0f0f1a", fontWeight: annual ? 500 : 600, fontSize: "0.9375rem", cursor: "pointer", boxShadow: annual ? "none" : "0 1px 4px rgba(0,0,0,0.1)", fontFamily: "inherit", transition: "all 0.15s ease" }}
            >
              Monatlich
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{ padding: "0.5rem 1.125rem", borderRadius: 7, border: "none", background: annual ? "#ffffff" : "transparent", color: annual ? "#0f0f1a" : "#6b7280", fontWeight: annual ? 600 : 500, fontSize: "0.9375rem", cursor: "pointer", boxShadow: annual ? "0 1px 4px rgba(0,0,0,0.1)" : "none", fontFamily: "inherit", transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              Jährlich
              <span style={{ display: "inline-block", background: "#dcfce7", color: "#15803d", fontSize: "0.75rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: 100 }}>
                2 Monate gratis
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", alignItems: "start" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={plan.featured ? "featured-plan" : undefined}
              style={{
                background: "#ffffff",
                border: plan.featured ? "2px solid #0066ff" : "1.5px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                padding: "1.5rem",
                position: "relative",
                boxShadow: plan.featured ? "0 0 0 4px rgba(0,102,255,0.05), 0 10px 36px rgba(0,102,255,0.12)" : "none",
              }}
            >
              {plan.featured && plan.badge && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#0066ff", color: "#fff", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.25rem 0.75rem", borderRadius: 100, whiteSpace: "nowrap" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.375rem" }}>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: plan.featured ? "#0066ff" : "#0f0f1a", letterSpacing: "-0.02em" }}>{plan.name}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af", whiteSpace: "nowrap" }}>{plan.limit}</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.875rem", lineHeight: 1.5 }}>{plan.description}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.1rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#0f0f1a" }}>€</span>
                  <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f0f1a", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {annual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "#9ca3af", marginLeft: "0.125rem" }}>/Monat</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                  {annual ? "zzgl. MwSt., jährliche Zahlung" : "zzgl. MwSt., monatlich kündbar"}
                </p>
              </div>

              <Link
                href={plan.href}
                style={{
                  display: "block", textAlign: "center", textDecoration: "none", fontWeight: 600, fontSize: "0.9375rem", padding: "0.6875rem 1rem", borderRadius: 8, marginBottom: "1.125rem",
                  background: plan.featured ? "#0066ff" : "transparent",
                  color: plan.featured ? "#ffffff" : "#374151",
                  border: plan.featured ? "none" : "1.5px solid rgba(0,0,0,0.12)",
                  boxShadow: plan.featured ? "0 4px 14px rgba(0,102,255,0.3)" : "none",
                }}
              >
                Kostenlos testen
              </Link>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1.125rem" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#374151", lineHeight: 1.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}><CheckIcon /></span>
                    <span>{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#d1d5db", lineHeight: 1.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}><CrossIcon /></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "#9ca3af", marginTop: "1.5rem" }}>
          Alle Pläne starten mit 30 Tagen Free Trial · Keine Kreditkarte · Monatlich kündbar
        </p>
      </div>
    </section>
  );
}
