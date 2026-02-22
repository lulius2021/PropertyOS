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
        return "bg-yellow-100 text-yellow-800";
      case "GAS":
        return "bg-orange-100 text-orange-800";
      case "WASSER_KALT":
        return "bg-blue-100 text-blue-800";
      case "WASSER_WARM":
        return "bg-red-100 text-red-800";
      case "WAERME":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zählerverwaltung</h1>
          <p className="mt-2 text-gray-600">
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
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Gesamt</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats.gesamt}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Strom</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.strom}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Gas</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.gas}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Wasser</div>
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
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setTypFilter("STROM")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "STROM"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Strom
        </button>
        <button
          onClick={() => setTypFilter("GAS")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "GAS"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Gas
        </button>
        <button
          onClick={() => setTypFilter("WASSER_KALT")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "WASSER_KALT"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Wasser kalt
        </button>
        <button
          onClick={() => setTypFilter("WASSER_WARM")}
          className={`rounded px-3 py-1 text-sm ${
            typFilter === "WASSER_WARM"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Wasser warm
        </button>
      </div>

      {/* Tabelle */}
      {zaehler && zaehler.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Zähler vorhanden
          </h3>
          <p className="mt-2 text-gray-600">
            Legen Sie Ihren ersten Zähler an.
          </p>
          <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Zähler anlegen
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zählernummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zuordnung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ablesungen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zaehler?.map((z: any) => (
                <tr key={z.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/zaehler/${z.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {z.objekt
                      ? `Objekt: ${z.objekt.bezeichnung}`
                      : z.einheit
                        ? `Einheit: ${z.einheit.einheitNr}`
                        : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
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
