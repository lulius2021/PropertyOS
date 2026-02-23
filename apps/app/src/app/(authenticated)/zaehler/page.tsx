"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ZaehlerPage() {
  const router = useRouter();
  const [typFilter, setTypFilter] = useState<
    "STROM" | "GAS" | "WASSER_KALT" | "WASSER_WARM" | "WAERME" | undefined
  >();

  const { data: zaehler, isLoading } = trpc.zaehler.list.useQuery({
    typ: typFilter,
  });
  const { data: stats } = trpc.zaehler.stats.useQuery();

  if (isLoading) {
    return <div>Laden...</div>;
  }

  const getTypColor = (typ: string) => {
    switch (typ) {
      case "STROM":
        return "bg-yellow-500/15 text-yellow-400";
      case "GAS":
        return "bg-orange-500/15 text-orange-400";
      case "WASSER_KALT":
        return "bg-blue-500/15 text-blue-400";
      case "WASSER_WARM":
        return "bg-red-500/15 text-red-400";
      case "WAERME":
        return "bg-purple-500/15 text-purple-400";
      default:
        return "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]";
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Zählerverwaltung</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Verwaltung von Strom-, Gas- und Wasserzählern
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + Neuer Zähler
        </button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Gesamt</div>
            <div className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
              {stats.gesamt}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Strom</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.strom}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Gas</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.gas}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Wasser</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.wasser}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTypFilter(undefined)}
          className={`rounded px-3 py-1 text-sm ${
            !typFilter
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setTypFilter("STROM")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "STROM"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Strom
        </button>
        <button
          onClick={() => setTypFilter("GAS")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "GAS"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Gas
        </button>
        <button
          onClick={() => setTypFilter("WASSER_KALT")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "WASSER_KALT"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Wasser kalt
        </button>
        <button
          onClick={() => setTypFilter("WASSER_WARM")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "WASSER_WARM"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Wasser warm
        </button>
      </div>

      {/* Tabelle */}
      {zaehler && zaehler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-page)] p-12 text-center">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">
            Keine Zähler vorhanden
          </h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Legen Sie Ihren ersten Zähler an.
          </p>
          <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Zähler anlegen
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--bg-page)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Zählernummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Zuordnung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Ablesungen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-card)]">
              {zaehler?.map((z: any) => (
                <tr key={z.id} className="hover:bg-[var(--bg-card-hover)] cursor-pointer" onClick={() => router.push(`/zaehler/${z.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">
                      {z.zaehlernummer}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getTypColor(z.typ)}`}
                    >
                      {z.typ}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {z.objekt
                      ? `Objekt: ${z.objekt.bezeichnung}`
                      : z.einheit
                        ? `Einheit: ${z.einheit.einheitNr}`
                        : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {z._count.ablesungen} Ablesung(en)
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/zaehler/${z.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
