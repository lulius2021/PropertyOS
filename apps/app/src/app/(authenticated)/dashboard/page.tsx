"use client";

import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(num);
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  alert,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${alert ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${alert ? "text-orange-700" : "text-gray-500"}`}>
            {label}
          </p>
          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${alert ? "text-orange-900" : "text-gray-900"}`}
          >
            {value}
          </p>
        </div>
        <div className={`ml-4 rounded-xl p-3 ${iconBg}`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      {sub && (
        <p className={`mt-3 text-sm ${alert ? "text-orange-600" : "text-gray-500"}`}>{sub}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: kpis, isLoading } = trpc.reporting.dashboardKPIs.useQuery();

  const occupancyRate =
    kpis?.einheiten.gesamt
      ? Math.round((kpis.einheiten.vermietet / kpis.einheiten.gesamt) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Objekte */}
        <KpiCard
          label="Objekte"
          value={isLoading ? "—" : kpis?.objekte ?? 0}
          sub="Verwaltete Liegenschaften"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        {/* Einheiten */}
        <KpiCard
          label="Einheiten"
          value={isLoading ? "—" : kpis?.einheiten.gesamt ?? 0}
          sub={
            !isLoading && kpis ? (
              <span>
                <span className="font-medium text-green-600">{kpis.einheiten.vermietet} vermietet</span>
                {" · "}
                <span className="font-medium text-gray-400">{kpis.einheiten.frei} frei</span>
              </span>
            ) : undefined
          }
          iconBg="bg-green-100"
          iconColor="text-green-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />

        {/* Rückstände */}
        <KpiCard
          label="Offene Rückstände"
          value={isLoading ? "—" : formatCurrency(kpis?.rueckstaende ?? 0)}
          sub="Fällige Zahlungen"
          alert={!isLoading && parseFloat(String(kpis?.rueckstaende ?? 0)) > 0}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Tickets */}
        <KpiCard
          label="Offene Tickets"
          value={isLoading ? "—" : kpis?.offeneTickets ?? 0}
          sub="Zu bearbeitende Meldungen"
          iconBg="bg-red-100"
          iconColor="text-red-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Occupancy Bar + Alerts Row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Occupancy */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Vermietungsquote</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {isLoading ? "—" : `${occupancyRate} %`}
          </p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-gray-100">
            <div
              className="h-2.5 rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{kpis?.einheiten.vermietet ?? 0} vermietet</span>
            <span>{kpis?.einheiten.frei ?? 0} leer</span>
          </div>
        </div>

        {/* Unklar-Zahlungen Alert */}
        {!isLoading && kpis && kpis.unklareZahlungen > 0 && (
          <Link
            href="/bank"
            className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm transition-colors hover:bg-yellow-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Handlungsbedarf</p>
                <p className="mt-2 text-3xl font-bold text-yellow-900">{kpis.unklareZahlungen}</p>
                <p className="mt-1 text-sm text-yellow-700">Zahlungen nicht zugeordnet</p>
              </div>
              <div className="ml-4 rounded-xl bg-yellow-200 p-3">
                <svg className="h-5 w-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-yellow-800">
              Jetzt in der Bank-Inbox zuordnen →
            </p>
          </Link>
        )}
      </div>

      {/* Quick Nav */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Schnellzugriff
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "/objekte",
              title: "Objekte",
              desc: "Liegenschaften & Einheiten",
              color: "text-blue-600",
              bg: "bg-blue-50 hover:bg-blue-100",
              border: "border-blue-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              ),
            },
            {
              href: "/mieter",
              title: "Mieter",
              desc: "Mieterakten verwalten",
              color: "text-green-600",
              bg: "bg-green-50 hover:bg-green-100",
              border: "border-green-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              ),
            },
            {
              href: "/sollstellungen",
              title: "Sollstellungen",
              desc: "Forderungen & Zahlungen",
              color: "text-orange-600",
              bg: "bg-orange-50 hover:bg-orange-100",
              border: "border-orange-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              ),
            },
            {
              href: "/tickets",
              title: "Tickets",
              desc: "Schadensmeldungen",
              color: "text-red-600",
              bg: "bg-red-50 hover:bg-red-100",
              border: "border-red-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              ),
            },
            {
              href: "/bank",
              title: "Bank",
              desc: "CSV-Import & Zuordnung",
              color: "text-indigo-600",
              bg: "bg-indigo-50 hover:bg-indigo-100",
              border: "border-indigo-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              ),
            },
            {
              href: "/mahnungen",
              title: "Mahnwesen",
              desc: "Mahnungen erstellen",
              color: "text-purple-600",
              bg: "bg-purple-50 hover:bg-purple-100",
              border: "border-purple-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              ),
            },
            {
              href: "/zaehler",
              title: "Zähler",
              desc: "Ablesungen erfassen",
              color: "text-teal-600",
              bg: "bg-teal-50 hover:bg-teal-100",
              border: "border-teal-100",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              ),
            },
            {
              href: "/reporting",
              title: "Reporting",
              desc: "Auswertungen & Exporte",
              color: "text-gray-600",
              bg: "bg-gray-50 hover:bg-gray-100",
              border: "border-gray-200",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ),
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${item.bg} ${item.border}`}
            >
              <div className={`rounded-lg bg-white p-2 shadow-sm`}>
                <svg className={`h-5 w-5 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 truncate">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
