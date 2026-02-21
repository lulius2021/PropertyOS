"use client";

import { WidgetType, WidgetSize } from "./types";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = {
  green: "#22c55e",
  emerald: "#10b981",
  gray: "#e5e7eb",
  grayDark: "#9ca3af",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  teal: "#14b8a6",
  indigo: "#6366f1",
  rose: "#f43f5e",
  amber: "#f59e0b",
  cyan: "#06b6d4",
};

function DonutChart({
  data,
  innerLabel,
  innerSublabel,
  size,
}: {
  data: { name: string; value: number; color: string }[];
  innerLabel: string;
  innerSublabel?: string;
  size: WidgetSize;
}) {
  const isSmall = size === "small";
  const outerRadius = isSmall ? 50 : 70;
  const innerRadius = isSmall ? 35 : 50;
  const cx = "50%";
  const cy = "50%";

  return (
    <div className="relative flex items-center justify-center" style={{ width: "100%", height: isSmall ? 110 : 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            strokeWidth={0}
            animationDuration={600}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`font-bold text-gray-900 ${isSmall ? "text-lg" : "text-2xl"}`}>{innerLabel}</span>
        {innerSublabel && !isSmall && (
          <span className="text-xs text-gray-500">{innerSublabel}</span>
        )}
      </div>
    </div>
  );
}

function HorizontalBarChart({
  data,
  size,
  formatValue,
}: {
  data: { name: string; value: number; color: string }[];
  size: WidgetSize;
  formatValue?: (v: number) => string;
}) {
  const isSmall = size === "small";
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((v: number) => String(v));

  return (
    <div className={`space-y-${isSmall ? "1" : "2"} w-full`}>
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <span className={`${isSmall ? "w-10 text-[10px]" : "w-16 text-xs"} text-gray-500 truncate`}>{item.name}</span>
          <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.max((item.value / maxVal) * 100, item.value > 0 ? 4 : 0)}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
          <span className={`${isSmall ? "w-8 text-[10px]" : "w-14 text-xs"} text-right font-semibold text-gray-900`}>
            {fmt(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

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

  // All statistics hooks at top level — React Rules of Hooks requires unconditional calls
  const { data: vermietungData, isLoading: vermietungLoading } = trpc.statistik.vermietung.useQuery();
  const { data: sollIstData, isLoading: sollIstLoading } = trpc.statistik.sollIst.useQuery();
  const { data: cashflowData, isLoading: cashflowLoading } = trpc.statistik.cashflow.useQuery();
  const { data: finanzierungData, isLoading: finanzierungLoading } = trpc.statistik.finanzierung.useQuery();
  const { data: kostenAnalyseData, isLoading: kostenAnalyseLoading } = trpc.statistik.kostenAnalyse.useQuery();
  const { data: ticketAnalyseData, isLoading: ticketAnalyseLoading } = trpc.statistik.ticketAnalyse.useQuery();
  const { data: zaehlerAnalyseData, isLoading: zaehlerAnalyseLoading } = trpc.statistik.zaehlerAnalyse.useQuery();
  const { data: mieteAnalyseData, isLoading: mieteAnalyseLoading } = trpc.statistik.mieteAnalyse.useQuery();
  const { data: datenqualitaetData, isLoading: datenqualitaetLoading } = trpc.statistik.datenqualitaet.useQuery();
  const { data: sollIstMonatlichData, isLoading: sollIstMonatlichLoading } = trpc.statistik.sollIstMonatlich.useQuery();
  const { data: cashflowMonatlichData, isLoading: cashflowMonatlichLoading } = trpc.statistik.cashflowMonatlich.useQuery();
  const { data: kostenMonatlichData, isLoading: kostenMonatlichLoading } = trpc.statistik.kostenMonatlich.useQuery();
  const { data: ticketsMonatlichData, isLoading: ticketsMonatlichLoading } = trpc.statistik.ticketsMonatlich.useQuery();

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
    const stats = vermietungData; const loading = vermietungLoading;
    const quote = stats?.belegungsquote ?? 0;
    const chartData = stats ? [
      { name: "Vermietet", value: stats.einheitenVermietet, color: CHART_COLORS.emerald },
      { name: "Leer", value: stats.einheitenLeer, color: CHART_COLORS.gray },
    ] : [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Belegungsquote</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData}
                innerLabel={`${quote.toFixed(1)}%`}
                innerSublabel="belegt"
                size={size}
              />
              {!isSmall && stats && (
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    {stats.einheitenVermietet} vermietet
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />
                    {stats.einheitenLeer} leer
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "leerstandsquote") {
    const stats = vermietungData; const loading = vermietungLoading;
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
    const stats = vermietungData; const loading = vermietungLoading;
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
    const stats = vermietungData; const loading = vermietungLoading;
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
    const stats = vermietungData; const loading = vermietungLoading;
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
    const stats = sollIstData; const loading = sollIstLoading;
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
    const stats = sollIstData; const loading = sollIstLoading;
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
    const stats = sollIstData; const loading = sollIstLoading;
    const quote = stats?.einzugsquote ?? 0;
    const mainColor = quote > 95 ? CHART_COLORS.green : quote > 80 ? CHART_COLORS.yellow : CHART_COLORS.red;
    const offen = stats ? stats.sollSumme - stats.istSumme : 0;
    const chartData = stats ? [
      { name: "Eingezogen", value: stats.istSumme, color: mainColor },
      { name: "Offen", value: Math.max(offen, 0), color: CHART_COLORS.gray },
    ] : [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Einzugsquote</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData}
                innerLabel={`${quote.toFixed(1)}%`}
                innerSublabel="eingezogen"
                size={size}
              />
              {!isSmall && stats && (
                <p className="mt-1 text-center text-xs text-gray-500">
                  {formatCurrency(stats.istSumme)} von {formatCurrency(stats.sollSumme)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "mietrueckstaende") {
    const stats = sollIstData; const loading = sollIstLoading;
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
    const stats = sollIstData; const loading = sollIstLoading;
    const aging = stats?.aging;
    const bars = [
      { name: "0–30", value: aging?.bis30 ?? 0, color: CHART_COLORS.yellow },
      { name: "31–60", value: aging?.bis60 ?? 0, color: CHART_COLORS.orange },
      { name: "61–90", value: aging?.bis90 ?? 0, color: CHART_COLORS.red },
      { name: "> 90", value: aging?.ueber90 ?? 0, color: "#dc2626" },
    ];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Aging Rückstände</p>
          <div className="mt-3 flex-1">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : (
              <HorizontalBarChart
                data={bars}
                size={size}
                formatValue={(v) => formatCurrency(v)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "zahlungsverzug") {
    const stats = sollIstData; const loading = sollIstLoading;
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
    const stats = cashflowData; const loading = cashflowLoading;
    const value = stats?.operativerCashflow ?? 0;
    const isPositive = value >= 0;
    const chartData = stats ? [
      { name: "Einnahmen", value: stats.einnahmen, fill: CHART_COLORS.green },
      { name: "Ausgaben", value: stats.ausgabenOpex, fill: CHART_COLORS.red },
    ] : [];
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className={`text-sm font-medium ${isPositive ? "text-green-700" : "text-red-700"}`}>Operativer Cashflow</p>
            <p className={`font-bold ${isPositive ? "text-green-900" : "text-red-900"} ${isSmall ? "text-lg" : "text-xl"}`}>
              {loading ? "—" : formatCurrency(value)}
            </p>
          </div>
          {!loading && stats && !isSmall && (
            <div className="mt-2 flex-1" style={{ minHeight: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={65} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} animationDuration={600}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!isSmall && stats && (
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Einnahmen
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                Ausgaben
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "cashflowNachDebt") {
    const stats = cashflowData; const loading = cashflowLoading;
    const value = stats?.cashflowNachDebt ?? 0;
    const isPositive = value >= 0;
    const chartData = stats ? [
      { name: "Op. CF", value: stats.operativerCashflow, fill: CHART_COLORS.green },
      { name: "Kapital", value: stats.debtServiceGesamt, fill: CHART_COLORS.violet },
    ] : [];
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${isPositive ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between">
            <p className={`text-sm font-medium ${isPositive ? "text-green-700" : "text-red-700"}`}>CF nach Kapitaldienst</p>
            <p className={`font-bold ${isPositive ? "text-green-900" : "text-red-900"} ${isSmall ? "text-lg" : "text-xl"}`}>
              {loading ? "—" : formatCurrency(value)}
            </p>
          </div>
          {!loading && stats && !isSmall && (
            <div className="mt-2 flex-1" style={{ minHeight: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} animationDuration={600}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!isSmall && stats && (
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                Cashflow
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
                Kapitaldienst
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "debtService") {
    const stats = cashflowData; const loading = cashflowLoading;
    const chartData = stats ? [
      { name: "Zins", value: stats.debtServiceZins, color: CHART_COLORS.teal },
      { name: "Tilgung", value: stats.debtServiceTilgung, color: CHART_COLORS.violet },
    ].filter((d) => d.value > 0) : [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Kapitaldienst</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData.length > 0 ? chartData : [{ name: "Keine", value: 1, color: CHART_COLORS.gray }]}
                innerLabel={formatCurrency(stats?.debtServiceGesamt ?? 0)}
                size={size}
              />
              {!isSmall && stats && (
                <div className="mt-1 flex justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500" />
                    Zins {formatCurrency(stats.debtServiceZins)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
                    Tilgung {formatCurrency(stats.debtServiceTilgung)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // D) Finanzierung Widgets
  // ───────────────────────────────────────────────────────

  if (type === "restschuld") {
    const stats = finanzierungData; const loading = finanzierungLoading;
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
    const stats = finanzierungData; const loading = finanzierungLoading;
    const value = stats?.dscr ?? 0;
    const mainColor = value > 1.2 ? CHART_COLORS.green : value > 1.0 ? CHART_COLORS.yellow : CHART_COLORS.red;
    const bgColor = value > 1.2 ? "border-green-200 bg-green-50" : value > 1.0 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50";
    const label = value > 1.2 ? "gut" : value > 1.0 ? "grenzwertig" : "kritisch";
    // Gauge: fill proportional to DSCR (0 to 2 as max)
    const fill = Math.min(value / 2, 1);
    const chartData = [
      { name: "DSCR", value: fill * 100, color: mainColor },
      { name: "Rest", value: (1 - fill) * 100, color: CHART_COLORS.gray },
    ];
    return (
      <div className={`h-full rounded-xl border p-4 shadow-sm ${bgColor}`}>
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-600">DSCR</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData}
                innerLabel={`${value.toFixed(2)}x`}
                innerSublabel={label}
                size={size}
              />
              {!isSmall && (
                <p className="mt-1 text-center text-xs text-gray-500">
                  Schuldendienstdeckungsgrad
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "kredituebersicht") {
    const stats = finanzierungData; const loading = finanzierungLoading;
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
    const stats = kostenAnalyseData; const loading = kostenAnalyseLoading;
    const chartData = stats ? [
      { name: "BK", value: stats.bkRelevant, color: CHART_COLORS.blue },
      { name: "HK", value: stats.hkRelevant, color: CHART_COLORS.orange },
      { name: "Sonstige", value: stats.sonstige, color: CHART_COLORS.grayDark },
    ].filter((d) => d.value > 0) : [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Gesamtkosten</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData.length > 0 ? chartData : [{ name: "Keine", value: 1, color: CHART_COLORS.gray }]}
                innerLabel={formatCurrency(stats?.kostenGesamt ?? 0)}
                size={size}
              />
              {!isSmall && stats && (
                <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                    BK {formatCurrency(stats.bkRelevant)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                    HK {formatCurrency(stats.hkRelevant)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
                    Sonst. {formatCurrency(stats.sonstige)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (type === "kostenProQm") {
    const stats = kostenAnalyseData; const loading = kostenAnalyseLoading;
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
    const stats = kostenAnalyseData; const loading = kostenAnalyseLoading;
    const kategorien = stats?.nachKategorie ?? [];
    const pieColors = [CHART_COLORS.rose, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.teal, CHART_COLORS.violet, CHART_COLORS.amber, CHART_COLORS.cyan, CHART_COLORS.indigo];
    const chartData = kategorien.map((k, idx) => ({
      name: k.kategorie,
      value: k.summe,
      color: pieColors[idx % pieColors.length],
    }));
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Kosten nach Kategorie</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : kategorien.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">Keine Kostendaten vorhanden</p>
          ) : (
            <>
              <DonutChart
                data={chartData}
                innerLabel={`${kategorien.length}`}
                innerSublabel="Kategorien"
                size={size}
              />
              {!isSmall && (
                <div className="mt-1 space-y-1 overflow-auto max-h-20">
                  {kategorien.slice(0, 5).map((k, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 truncate max-w-[60%]">
                        <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                        {k.kategorie}
                      </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(k.summe)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // F) Ticket Widgets
  // ───────────────────────────────────────────────────────

  if (type === "ticketsPrioritaet") {
    const stats = ticketAnalyseData; const loading = ticketAnalyseLoading;
    const prio = stats?.nachPrioritaet;
    const bars = [
      { name: "Niedrig", value: prio?.niedrig ?? 0, color: CHART_COLORS.green },
      { name: "Mittel", value: prio?.mittel ?? 0, color: CHART_COLORS.yellow },
      { name: "Hoch", value: prio?.hoch ?? 0, color: CHART_COLORS.orange },
      { name: "Kritisch", value: prio?.kritisch ?? 0, color: CHART_COLORS.red },
    ];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Tickets nach Priorität</p>
          <div className="mt-3 flex-1">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : (
              <HorizontalBarChart data={bars} size={size} />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "ticketBearbeitungszeit") {
    const stats = ticketAnalyseData; const loading = ticketAnalyseLoading;
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
    const stats = ticketAnalyseData; const loading = ticketAnalyseLoading;
    const kategorien = stats?.topKategorien ?? [];
    const katColors = [CHART_COLORS.amber, CHART_COLORS.orange, CHART_COLORS.rose, CHART_COLORS.violet, CHART_COLORS.blue];
    const bars = kategorien.map((k, idx) => ({
      name: k.kategorie,
      value: k.anzahl,
      color: katColors[idx % katColors.length],
    }));
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Ticket-Kategorien</p>
          <div className="mt-3 flex-1">
            {loading ? (
              <p className="text-2xl font-bold text-gray-900">—</p>
            ) : kategorien.length === 0 ? (
              <p className="text-sm text-gray-400">Keine Ticketdaten vorhanden</p>
            ) : (
              <HorizontalBarChart data={bars} size={size} />
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
    const stats = zaehlerAnalyseData; const loading = zaehlerAnalyseLoading;
    const quote = stats?.vollstaendigkeitsquote ?? 0;
    const mainColor = quote > 90 ? CHART_COLORS.green : quote > 70 ? CHART_COLORS.yellow : CHART_COLORS.red;
    const chartData = stats ? [
      { name: "Mit Ablesung", value: stats.zaehlerMitAblesung, color: mainColor },
      { name: "Ohne", value: stats.zaehlerGesamt - stats.zaehlerMitAblesung, color: CHART_COLORS.gray },
    ] : [];
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <p className="text-sm font-medium text-gray-500">Zähler-Vollständigkeit</p>
          {loading ? (
            <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
          ) : (
            <>
              <DonutChart
                data={chartData}
                innerLabel={`${quote.toFixed(0)}%`}
                innerSublabel="erfasst"
                size={size}
              />
              {!isSmall && stats && (
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: mainColor }} />
                    {stats.zaehlerMitAblesung} erfasst
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />
                    {stats.zaehlerGesamt - stats.zaehlerMitAblesung} offen
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────
  // J) Miete Widgets
  // ───────────────────────────────────────────────────────

  if (type === "kaltmieteProQm") {
    const stats = mieteAnalyseData; const loading = mieteAnalyseLoading;
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
    const stats = mieteAnalyseData; const loading = mieteAnalyseLoading;
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
    const stats = datenqualitaetData; const loading = datenqualitaetLoading;
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
    const stats = datenqualitaetData; const loading = datenqualitaetLoading;
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

  // ───────────────────────────────────────────────────────
  // Zeitverlauf-Charts
  // ───────────────────────────────────────────────────────

  if (type === "sollIstVerlauf") {
    const monate = sollIstMonatlichData; const loading = sollIstMonatlichLoading;
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Soll / Ist Verlauf</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                Soll
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                Ist
              </span>
            </div>
          </div>
          <div className="mt-2 flex-1" style={{ minHeight: isSmall ? 100 : 160 }}>
            {loading || !monate ? (
              <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v) || 0)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="soll" name="Soll" fill={CHART_COLORS.blue} radius={[3, 3, 0, 0]} barSize={isSmall ? 6 : 12} animationDuration={600} />
                  <Bar dataKey="ist" name="Ist" fill={CHART_COLORS.green} radius={[3, 3, 0, 0]} barSize={isSmall ? 6 : 12} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "cashflowVerlauf") {
    const monate = cashflowMonatlichData; const loading = cashflowMonatlichLoading;
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Cashflow Verlauf</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500" />
                Cashflow
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                Einnahmen
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" />
                Ausgaben
              </span>
            </div>
          </div>
          <div className="mt-2 flex-1" style={{ minHeight: isSmall ? 100 : 160 }}>
            {loading || !monate ? (
              <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v) || 0)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="einnahmen" name="Einnahmen" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={600} />
                  <Line type="monotone" dataKey="ausgaben" name="Ausgaben" stroke={CHART_COLORS.red} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={600} />
                  <Line type="monotone" dataKey="cashflow" name="Cashflow" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 3, fill: CHART_COLORS.teal }} activeDot={{ r: 5 }} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "kostenVerlauf") {
    const monate = kostenMonatlichData; const loading = kostenMonatlichLoading;
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Kosten Verlauf</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                BK
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                HK
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" />
                Sonst.
              </span>
            </div>
          </div>
          <div className="mt-2 flex-1" style={{ minHeight: isSmall ? 100 : 160 }}>
            {loading || !monate ? (
              <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v) || 0)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="bk" name="BK" stackId="a" fill={CHART_COLORS.blue} barSize={isSmall ? 8 : 16} animationDuration={600} />
                  <Bar dataKey="hk" name="HK" stackId="a" fill={CHART_COLORS.orange} barSize={isSmall ? 8 : 16} animationDuration={600} />
                  <Bar dataKey="sonstige" name="Sonstige" stackId="a" fill={CHART_COLORS.grayDark} radius={[3, 3, 0, 0]} barSize={isSmall ? 8 : 16} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "ticketsVerlauf") {
    const monate = ticketsMonatlichData; const loading = ticketsMonatlichLoading;
    return (
      <div className="h-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Tickets Verlauf</p>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                Neu
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                Erledigt
              </span>
            </div>
          </div>
          <div className="mt-2 flex-1" style={{ minHeight: isSmall ? 100 : 160 }}>
            {loading || !monate ? (
              <p className="mt-4 text-2xl font-bold text-gray-900">—</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monate} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="neu" name="Neue Tickets" stroke={CHART_COLORS.amber} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS.amber }} activeDot={{ r: 6 }} animationDuration={600} />
                  <Line type="monotone" dataKey="abgeschlossen" name="Abgeschlossen" stroke={CHART_COLORS.green} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: CHART_COLORS.green }} activeDot={{ r: 5 }} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
