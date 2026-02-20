"use client";

import { WidgetType, WidgetSize } from "./types";
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

  return null;
}
