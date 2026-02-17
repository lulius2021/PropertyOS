"use client";

import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

export default function DashboardPage() {
  const { data: kpis, isLoading } = trpc.reporting.dashboardKPIs.useQuery();

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Übersicht über Ihre Immobilienverwaltung
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Objekte</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpis?.objekte || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Gesamt verwaltete Objekte</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Einheiten</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpis?.einheiten.gesamt || 0}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Davon vermietet: {kpis?.einheiten.vermietet || 0} (
            {kpis?.einheiten.gesamt
              ? Math.round(
                  (kpis.einheiten.vermietet / kpis.einheiten.gesamt) * 100
                )
              : 0}
            %)
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offene Rückstände</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpis?.rueckstaende || "0.00"} €
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Fällige Zahlungen</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offene Tickets</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {kpis?.offeneTickets || 0}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Zu bearbeitende Tickets</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {kpis && kpis.unklareZahlungen > 0 && (
          <Link
            href="/bank"
            className="rounded-lg border bg-yellow-50 border-yellow-200 p-6 shadow-sm hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Unklar-Zahlungen
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-900">
                  {kpis.unklareZahlungen}
                </p>
              </div>
              <div className="rounded-full bg-yellow-200 p-3">
                <svg
                  className="h-6 w-6 text-yellow-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-yellow-700">
              → Jetzt zuordnen
            </p>
          </Link>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/objekte"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Objekte</h3>
          <p className="mt-2 text-sm text-gray-600">
            Immobilien und Einheiten verwalten
          </p>
        </Link>

        <Link
          href="/sollstellungen"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Sollstellungen</h3>
          <p className="mt-2 text-sm text-gray-600">
            Forderungen und Zahlungen prüfen
          </p>
        </Link>

        <Link
          href="/mahnungen"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Mahnwesen</h3>
          <p className="mt-2 text-sm text-gray-600">
            Mahnungen erstellen und verfolgen
          </p>
        </Link>

        <Link
          href="/tickets"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900">Tickets</h3>
          <p className="mt-2 text-sm text-gray-600">
            Schadensmeldungen bearbeiten
          </p>
        </Link>
      </div>
    </div>
  );
}
