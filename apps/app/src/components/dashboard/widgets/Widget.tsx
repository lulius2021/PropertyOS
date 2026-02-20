"use client";

import { WidgetType, WidgetSize } from "./types";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";

interface WidgetProps {
  type: WidgetType;
  size: WidgetSize;
  data?: any;
  isLoading?: boolean;
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(num);
}

export function Widget({ type, size, data, isLoading }: WidgetProps) {
  const isSmall = size === "small";
  const isMedium = size === "medium";
  const isLarge = size === "large";

  // Objekte Widget
  if (type === "objekte") {
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Objekte</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {isLoading ? "—" : data?.objekte ?? 0}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-blue-100 p-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Verwaltete Liegenschaften</p>
          )}
        </div>
      </div>
    );
  }

  // Einheiten Widget
  if (type === "einheiten") {
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Einheiten</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {isLoading ? "—" : data?.einheiten?.gesamt ?? 0}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-green-100 p-3">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          {!isSmall && !isLoading && data && (
            <p className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-green-600">{data.einheiten.vermietet} vermietet</span>
              {" · "}
              <span className="font-medium text-gray-400">{data.einheiten.frei} frei</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Rückstände Widget
  if (type === "rueckstaende") {
    const hasArrears = !isLoading && parseFloat(String(data?.rueckstaende ?? 0)) > 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${hasArrears ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${hasArrears ? "text-orange-700" : "text-gray-500"}`}>
                Offene Rückstände
              </p>
              <p className={`mt-2 font-bold tracking-tight ${hasArrears ? "text-orange-900" : "text-gray-900"} ${isSmall ? "text-xl" : "text-3xl"}`}>
                {isLoading ? "—" : formatCurrency(data?.rueckstaende ?? 0)}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${hasArrears ? "bg-orange-200" : "bg-orange-100"}`}>
              <svg className={`h-5 w-5 ${hasArrears ? "text-orange-700" : "text-orange-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className={`mt-3 text-sm ${hasArrears ? "text-orange-600" : "text-gray-500"}`}>Fällige Zahlungen</p>
          )}
        </div>
      </div>
    );
  }

  // Tickets Widget
  if (type === "tickets") {
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Offene Tickets</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {isLoading ? "—" : data?.offeneTickets ?? 0}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-red-100 p-3">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Zu bearbeitende Meldungen</p>
          )}
        </div>
      </div>
    );
  }

  // Vermietungsquote Widget
  if (type === "vermietungsquote") {
    const occupancyRate = data?.einheiten?.gesamt
      ? Math.round((data.einheiten.vermietet / data.einheiten.gesamt) * 100)
      : 0;

    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Vermietungsquote</p>
            <p className={`mt-2 font-bold text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
              {isLoading ? "—" : `${occupancyRate} %`}
            </p>
          </div>
          <div className="mt-4">
            <div className="h-2.5 w-full rounded-full bg-gray-100">
              <div
                className="h-2.5 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            {!isSmall && (
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{data?.einheiten?.vermietet ?? 0} vermietet</span>
                <span>{data?.einheiten?.frei ?? 0} leer</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handlungsbedarf Widget
  if (type === "handlungsbedarf") {
    const hasAlerts = !isLoading && data?.unklareZahlungen > 0;

    if (!hasAlerts) {
      return (
        <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 rounded-xl bg-green-100 p-3 w-fit">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Alles erledigt</p>
              <p className="mt-1 text-xs text-gray-500">Keine offenen Aufgaben</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        href="/bank"
        className="block h-full rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm transition-colors hover:bg-yellow-100"
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-yellow-700">Handlungsbedarf</p>
              <p className={`mt-2 font-bold text-yellow-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {data.unklareZahlungen}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-yellow-200 p-3">
              <svg className="h-5 w-5 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <>
              <p className="mt-1 text-sm text-yellow-700">Zahlungen nicht zugeordnet</p>
              <p className="mt-3 text-sm font-medium text-yellow-800">
                Jetzt in der Bank-Inbox zuordnen →
              </p>
            </>
          )}
        </div>
      </Link>
    );
  }

  // Schnellzugriff Widget
  if (type === "schnellzugriff") {
    const quickLinks = [
      { href: "/objekte", title: "Objekte", color: "text-blue-600", bg: "bg-blue-50" },
      { href: "/mieter", title: "Mieter", color: "text-green-600", bg: "bg-green-50" },
      { href: "/sollstellungen", title: "Sollstellungen", color: "text-orange-600", bg: "bg-orange-50" },
      { href: "/tickets", title: "Tickets", color: "text-red-600", bg: "bg-red-50" },
      { href: "/bank", title: "Bank", color: "text-indigo-600", bg: "bg-indigo-50" },
      { href: "/mahnungen", title: "Mahnwesen", color: "text-purple-600", bg: "bg-purple-50" },
      { href: "/zaehler", title: "Zähler", color: "text-teal-600", bg: "bg-teal-50" },
      { href: "/reporting", title: "Reporting", color: "text-gray-600", bg: "bg-gray-50" },
    ];

    const displayLinks = isSmall ? quickLinks.slice(0, 4) : quickLinks;

    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Schnellzugriff
        </h3>
        <div className={`grid gap-3 ${isLarge ? "grid-cols-4" : "grid-cols-2"}`}>
          {displayLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-center rounded-lg border border-gray-100 p-3 transition-colors ${link.bg} hover:scale-105`}
            >
              <p className={`text-sm font-medium ${link.color}`}>{link.title}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // A) Vermietung Widgets
  // ───────────────────────────────────────────────────────

  if (type === "belegungsquote") {
    const { data: stats, isLoading: loading } = trpc.statistik.vermietung.useQuery();
    const quote = stats?.belegungsquote ?? 0;
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Belegungsquote</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${quote.toFixed(1)} %`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-emerald-100 p-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-gray-100">
              <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(quote, 100)}%` }} />
            </div>
            {!isSmall && stats && (
              <p className="mt-2 text-sm text-gray-500">
                {stats.einheitenVermietet} von {stats.einheitenGesamt} Einheiten vermietet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "leerstandsquote") {
    const { data: stats, isLoading: loading } = trpc.statistik.vermietung.useQuery();
    const quote = stats?.leerstandsquote ?? 0;
    const isHigh = quote > 10;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${isHigh ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${isHigh ? "text-red-700" : "text-gray-500"}`}>Leerstandsquote</p>
              <p className={`mt-2 font-bold tracking-tight ${isHigh ? "text-red-900" : "text-gray-900"} ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${quote.toFixed(1)} %`}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${isHigh ? "bg-red-200" : "bg-emerald-100"}`}>
              <svg className={`h-5 w-5 ${isHigh ? "text-red-700" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className={`mt-3 text-sm ${isHigh ? "text-red-600" : "text-gray-500"}`}>
              {stats.einheitenLeer} von {stats.einheitenGesamt} Einheiten leer
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "leerstandsdauer") {
    const { data: stats, isLoading: loading } = trpc.statistik.vermietung.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Leerstandsdauer</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${stats?.avgLeerstandsdauerTage?.toFixed(0) ?? 0} Tage`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-emerald-100 p-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Durchschnittliche Leerstandsdauer</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "fluktuationsquote") {
    const { data: stats, isLoading: loading } = trpc.statistik.vermietung.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Fluktuationsquote</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${stats?.fluktuationsquote?.toFixed(1) ?? 0} %`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-emerald-100 p-3">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Kuendigungen / Gesamteinheiten p.a.</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "ertragsverlustLeerstand") {
    const { data: stats, isLoading: loading } = trpc.statistik.vermietung.useQuery();
    const verlust = stats?.ertragsverlustLeerstand ?? 0;
    const hasLoss = verlust > 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${hasLoss ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${hasLoss ? "text-orange-700" : "text-gray-500"}`}>Ertragsverlust</p>
              <p className={`mt-2 font-bold tracking-tight ${hasLoss ? "text-orange-900" : "text-gray-900"} ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(verlust)}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${hasLoss ? "bg-orange-200" : "bg-emerald-100"}`}>
              <svg className={`h-5 w-5 ${hasLoss ? "text-orange-700" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className={`mt-3 text-sm ${hasLoss ? "text-orange-600" : "text-gray-500"}`}>Entgangene Mieteinnahmen durch Leerstand</p>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // B) Soll/Ist Widgets
  // ───────────────────────────────────────────────────────

  if (type === "sollstellungen") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Sollstellungen</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.sollSumme ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-blue-100 p-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Monatliche Soll-Mieten gesamt</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "istzahlungen") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    return (
      <div className="h-full rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-700">Ist-Zahlungen</p>
              <p className={`mt-2 font-bold tracking-tight text-green-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.istSumme ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-green-200 p-3">
              <svg className="h-5 w-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-green-600">Tatsaechlich eingegangene Zahlungen</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "einzugsquote") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    const quote = stats?.einzugsquote ?? 0;
    const barColor = quote > 95 ? "bg-green-500" : quote > 80 ? "bg-yellow-500" : "bg-red-500";
    const textColor = quote > 95 ? "text-green-700" : quote > 80 ? "text-yellow-700" : "text-red-700";
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Einzugsquote</p>
              <p className={`mt-2 font-bold tracking-tight ${textColor} ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${quote.toFixed(1)} %`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-blue-100 p-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-gray-100">
              <div className={`h-2.5 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(quote, 100)}%` }} />
            </div>
            {!isSmall && stats && (
              <p className="mt-2 text-sm text-gray-500">
                {formatCurrency(stats.istSumme)} von {formatCurrency(stats.sollSumme)} eingezogen
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "mietrueckstaende") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    const rueckstaende = stats?.rueckstaende ?? 0;
    const hasArrears = rueckstaende > 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${hasArrears ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${hasArrears ? "text-orange-700" : "text-gray-500"}`}>Mietrueckstaende</p>
              <p className={`mt-2 font-bold tracking-tight ${hasArrears ? "text-orange-900" : "text-gray-900"} ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(rueckstaende)}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${hasArrears ? "bg-orange-200" : "bg-blue-100"}`}>
              <svg className={`h-5 w-5 ${hasArrears ? "text-orange-700" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className={`mt-3 text-sm ${hasArrears ? "text-orange-600" : "text-gray-500"}`}>
              {stats.rueckstaendeMieterAnzahl} Mieter betroffen
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "agingRueckstaende") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    const aging = stats?.aging;
    const rows = [
      { label: "0–30 Tage", value: aging?.bis30 ?? 0, color: "bg-yellow-400" },
      { label: "31–60 Tage", value: aging?.bis60 ?? 0, color: "bg-orange-400" },
      { label: "61–90 Tage", value: aging?.bis90 ?? 0, color: "bg-red-400" },
      { label: "> 90 Tage", value: aging?.ueber90 ?? 0, color: "bg-red-600" },
    ];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Aging Rueckstaende</p>
            <div className="ml-4 rounded-xl bg-blue-100 p-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex-1 space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : (
              rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${row.color}`} />
                    <span className="text-xs text-gray-600">{row.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{formatCurrency(row.value)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "zahlungsverzug") {
    const { data: stats, isLoading: loading } = trpc.statistik.sollIst.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Zahlungsverzug</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${stats?.avgZahlungsverzugTage?.toFixed(0) ?? 0} Tage`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-blue-100 p-3">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className="mt-3 text-sm text-gray-500">Durchschnittlicher Zahlungsverzug</p>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // C) Cashflow Widgets
  // ───────────────────────────────────────────────────────

  if (type === "operativerCashflow") {
    const { data: stats, isLoading: loading } = trpc.statistik.cashflow.useQuery();
    const value = stats?.operativerCashflow ?? 0;
    const isPositive = value >= 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${isPositive ? "text-green-700" : "text-red-700"}`}>Operativer Cashflow</p>
              <p className={`mt-2 font-bold tracking-tight ${isPositive ? "text-green-900" : "text-red-900"} ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(value)}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${isPositive ? "bg-green-200" : "bg-red-200"}`}>
              <svg className={`h-5 w-5 ${isPositive ? "text-green-700" : "text-red-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className={`mt-3 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              Einnahmen {formatCurrency(stats.einnahmen)} - Ausgaben {formatCurrency(stats.ausgabenOpex)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "cashflowNachDebt") {
    const { data: stats, isLoading: loading } = trpc.statistik.cashflow.useQuery();
    const value = stats?.cashflowNachDebt ?? 0;
    const isPositive = value >= 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${isPositive ? "text-green-700" : "text-red-700"}`}>Cashflow nach Kapitaldienst</p>
              <p className={`mt-2 font-bold tracking-tight ${isPositive ? "text-green-900" : "text-red-900"} ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(value)}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${isPositive ? "bg-green-200" : "bg-red-200"}`}>
              <svg className={`h-5 w-5 ${isPositive ? "text-green-700" : "text-red-700"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className={`mt-3 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              Nach Zins + Tilgung ({formatCurrency(stats.debtServiceGesamt)})
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "debtService") {
    const { data: stats, isLoading: loading } = trpc.statistik.cashflow.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Kapitaldienst</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.debtServiceGesamt ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-teal-100 p-3">
              <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className="mt-3 text-sm text-gray-500">
              Zins {formatCurrency(stats.debtServiceZins)} + Tilgung {formatCurrency(stats.debtServiceTilgung)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // D) Finanzierung Widgets
  // ───────────────────────────────────────────────────────

  if (type === "restschuld") {
    const { data: stats, isLoading: loading } = trpc.statistik.finanzierung.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Restschuld</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.restschuldGesamt ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-violet-100 p-3">
              <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className="mt-3 text-sm text-gray-500">
              {stats.krediteAnzahl} Kredite, mtl. Rate {formatCurrency(stats.monatlicheRateGesamt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "dscr") {
    const { data: stats, isLoading: loading } = trpc.statistik.finanzierung.useQuery();
    const value = stats?.dscr ?? 0;
    const color = value > 1.2 ? "text-green-700" : value > 1.0 ? "text-yellow-700" : "text-red-700";
    const bgColor = value > 1.2 ? "border-green-200 bg-green-50" : value > 1.0 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50";
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${bgColor}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${color}`}>DSCR</p>
              <p className={`mt-2 font-bold tracking-tight ${color} ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${value.toFixed(2)}x`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-violet-100 p-3">
              <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          {!isSmall && (
            <p className={`mt-3 text-sm ${color}`}>
              Schuldendienstdeckungsgrad {value > 1.2 ? "(gut)" : value > 1.0 ? "(grenzwertig)" : "(kritisch)"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "kredituebersicht") {
    const { data: stats, isLoading: loading } = trpc.statistik.finanzierung.useQuery();
    const kredite = stats?.krediteDetails ?? [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Kredituebersicht</p>
            <div className="ml-4 rounded-xl bg-violet-100 p-3">
              <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex-1 overflow-auto">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : kredite.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Kredite vorhanden</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400">
                    <th className="pb-1 font-medium">Kredit</th>
                    {!isSmall && <th className="pb-1 font-medium">Bank</th>}
                    <th className="pb-1 text-right font-medium">Restschuld</th>
                    {!isSmall && <th className="pb-1 text-right font-medium">Rate</th>}
                  </tr>
                </thead>
                <tbody>
                  {kredite.map((k, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-1.5 font-medium text-gray-900 truncate max-w-[100px]">{k.bezeichnung}</td>
                      {!isSmall && <td className="py-1.5 text-gray-500 truncate max-w-[80px]">{k.bank}</td>}
                      <td className="py-1.5 text-right text-gray-900">{formatCurrency(k.restschuld)}</td>
                      {!isSmall && <td className="py-1.5 text-right text-gray-500">{formatCurrency(k.rate)}/mtl.</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // E) Kosten Widgets
  // ───────────────────────────────────────────────────────

  if (type === "kostenGesamt") {
    const { data: stats, isLoading: loading } = trpc.statistik.kostenAnalyse.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Gesamtkosten</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.kostenGesamt ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-rose-100 p-3">
              <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>BK-relevant</span>
                <span className="font-medium text-gray-700">{formatCurrency(stats.bkRelevant)}</span>
              </div>
              <div className="flex justify-between">
                <span>HK-relevant</span>
                <span className="font-medium text-gray-700">{formatCurrency(stats.hkRelevant)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sonstige</span>
                <span className="font-medium text-gray-700">{formatCurrency(stats.sonstige)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "kostenProQm") {
    const { data: stats, isLoading: loading } = trpc.statistik.kostenAnalyse.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Kosten pro m{"\u00B2"}</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : `${formatCurrency(stats?.kostenProQm ?? 0)}/m\u00B2`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-rose-100 p-3">
              <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className="mt-3 text-sm text-gray-500">
              Gesamtflaeche: {stats.gesamtFlaeche?.toFixed(0) ?? 0} m{"\u00B2"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "kostenNachKategorie") {
    const { data: stats, isLoading: loading } = trpc.statistik.kostenAnalyse.useQuery();
    const kategorien = stats?.nachKategorie ?? [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Kosten nach Kategorie</p>
            <div className="ml-4 rounded-xl bg-rose-100 p-3">
              <svg className="h-5 w-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex-1 overflow-auto space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : kategorien.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Kostendaten vorhanden</p>
            ) : (
              kategorien.map((k, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate max-w-[60%]">{k.kategorie}</span>
                  <span className="text-xs font-semibold text-gray-900">{formatCurrency(k.summe)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // F) Ticket Widgets
  // ───────────────────────────────────────────────────────

  if (type === "ticketsPrioritaet") {
    const { data: stats, isLoading: loading } = trpc.statistik.ticketAnalyse.useQuery();
    const prio = stats?.nachPrioritaet;
    const bars = [
      { label: "Niedrig", value: prio?.niedrig ?? 0, color: "bg-green-400" },
      { label: "Mittel", value: prio?.mittel ?? 0, color: "bg-yellow-400" },
      { label: "Hoch", value: prio?.hoch ?? 0, color: "bg-orange-500" },
      { label: "Kritisch", value: prio?.kritisch ?? 0, color: "bg-red-500" },
    ];
    const maxVal = Math.max(...bars.map((b) => b.value), 1);
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Tickets nach Prioritaet</p>
            <div className="ml-4 rounded-xl bg-amber-100 p-3">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex-1 space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : (
              bars.map((bar) => (
                <div key={bar.label} className="flex items-center gap-2">
                  <span className="w-14 text-xs text-gray-500">{bar.label}</span>
                  <div className="flex-1 h-4 rounded-full bg-gray-100">
                    <div
                      className={`h-4 rounded-full ${bar.color} transition-all duration-500`}
                      style={{ width: `${(bar.value / maxVal) * 100}%`, minWidth: bar.value > 0 ? "12px" : "0px" }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-gray-900">{bar.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "ticketBearbeitungszeit") {
    const { data: stats, isLoading: loading } = trpc.statistik.ticketAnalyse.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Bearbeitungszeit</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${stats?.avgBearbeitungsTage?.toFixed(1) ?? 0} Tage`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-amber-100 p-3">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className="mt-3 text-sm text-gray-500">
              {stats.offen} offen, {stats.abgeschlossen} abgeschlossen
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "ticketKategorien") {
    const { data: stats, isLoading: loading } = trpc.statistik.ticketAnalyse.useQuery();
    const kategorien = stats?.topKategorien ?? [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Ticket-Kategorien</p>
            <div className="ml-4 rounded-xl bg-amber-100 p-3">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 flex-1 overflow-auto space-y-2">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : kategorien.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Ticketdaten vorhanden</p>
            ) : (
              kategorien.map((k, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate max-w-[70%]">{k.kategorie}</span>
                  <span className="text-xs font-semibold text-gray-900">{k.anzahl}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // I) Zaehler Widgets
  // ───────────────────────────────────────────────────────

  if (type === "zaehlerVollstaendigkeit") {
    const { data: stats, isLoading: loading } = trpc.statistik.zaehlerAnalyse.useQuery();
    const quote = stats?.vollstaendigkeitsquote ?? 0;
    const barColor = quote > 90 ? "bg-green-500" : quote > 70 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Zaehler-Vollstaendigkeit</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : `${quote.toFixed(1)} %`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-cyan-100 p-3">
              <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-gray-100">
              <div className={`h-2.5 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${Math.min(quote, 100)}%` }} />
            </div>
            {!isSmall && stats && (
              <p className="mt-2 text-sm text-gray-500">
                {stats.zaehlerMitAblesung} von {stats.zaehlerGesamt} Zaehlern mit Ablesung
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // J) Miete Widgets
  // ───────────────────────────────────────────────────────

  if (type === "kaltmieteProQm") {
    const { data: stats, isLoading: loading } = trpc.statistik.mieteAnalyse.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Kaltmiete pro m{"\u00B2"}</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : `${formatCurrency(stats?.avgKaltmieteProQm ?? 0)}/m\u00B2`}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-indigo-100 p-3">
              <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className="mt-3 text-sm text-gray-500">
              {stats.mietverhaeltnisseAktiv} aktive Mietverhaeltnisse
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "gesamtMiete") {
    const { data: stats, isLoading: loading } = trpc.statistik.mieteAnalyse.useQuery();
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-500">Gesamtmiete</p>
              <p className={`mt-2 font-bold tracking-tight text-gray-900 ${isSmall ? "text-xl" : "text-3xl"}`}>
                {loading ? "—" : formatCurrency(stats?.gesamtMonatlicheWarmmiete ?? 0)}
              </p>
            </div>
            <div className="ml-4 rounded-xl bg-indigo-100 p-3">
              <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Kaltmiete</span>
                <span className="font-medium text-gray-700">{formatCurrency(stats.gesamtMonatlicheKaltmiete)}</span>
              </div>
              <div className="flex justify-between">
                <span>Warmmiete</span>
                <span className="font-medium text-gray-700">{formatCurrency(stats.gesamtMonatlicheWarmmiete)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // K) Datenqualitaet Widgets
  // ───────────────────────────────────────────────────────

  if (type === "unzugeordneteZahlungen") {
    const { data: stats, isLoading: loading } = trpc.statistik.datenqualitaet.useQuery();
    const count = stats?.unzugeordneteZahlungen ?? 0;
    const hasIssues = count > 0;
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${hasIssues ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${hasIssues ? "text-orange-700" : "text-gray-500"}`}>Unzugeordnete Zahlungen</p>
              <p className={`mt-2 font-bold tracking-tight ${hasIssues ? "text-orange-900" : "text-gray-900"} ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : count}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${hasIssues ? "bg-orange-200" : "bg-gray-100"}`}>
              <svg className={`h-5 w-5 ${hasIssues ? "text-orange-700" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {!isSmall && stats && (
            <p className={`mt-3 text-sm ${hasIssues ? "text-orange-600" : "text-gray-500"}`}>
              Summe: {formatCurrency(stats.unzugeordneteZahlungenSumme)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (type === "stammdatenLuecken") {
    const { data: stats, isLoading: loading } = trpc.statistik.datenqualitaet.useQuery();
    const luecken = stats?.stammdatenLuecken;
    const total = luecken
      ? (luecken.einheitenOhneFlaeche + luecken.mietverhaeltnisseOhneKaltmiete + luecken.objekteOhneAdresse + luecken.mieterOhneKontakt)
      : 0;
    const hasIssues = total > 0;
    const items = luecken ? [
      { label: "Einheiten ohne Flaeche", value: luecken.einheitenOhneFlaeche },
      { label: "MV ohne Kaltmiete", value: luecken.mietverhaeltnisseOhneKaltmiete },
      { label: "Objekte ohne Adresse", value: luecken.objekteOhneAdresse },
      { label: "Mieter ohne Kontakt", value: luecken.mieterOhneKontakt },
    ] : [];
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${hasIssues ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-white"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${hasIssues ? "text-yellow-700" : "text-gray-500"}`}>Stammdaten-Luecken</p>
              <p className={`mt-2 font-bold tracking-tight ${hasIssues ? "text-yellow-900" : "text-gray-900"} ${isSmall ? "text-2xl" : "text-3xl"}`}>
                {loading ? "—" : total}
              </p>
            </div>
            <div className={`ml-4 rounded-xl p-3 ${hasIssues ? "bg-yellow-200" : "bg-gray-100"}`}>
              <svg className={`h-5 w-5 ${hasIssues ? "text-yellow-700" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          {!isSmall && luecken && (
            <div className="mt-3 space-y-1">
              {items.filter((i) => i.value > 0).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className={hasIssues ? "text-yellow-700" : "text-gray-500"}>{item.label}</span>
                  <span className={`font-semibold ${hasIssues ? "text-yellow-900" : "text-gray-900"}`}>{item.value}</span>
                </div>
              ))}
              {items.every((i) => i.value === 0) && (
                <p className="text-xs text-green-600">Alle Stammdaten vollstaendig</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
