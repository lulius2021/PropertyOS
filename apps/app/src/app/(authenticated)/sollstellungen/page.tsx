"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import NeueSollstellungModal from "@/components/sollstellungen/NeueSollstellungModal";

export default function SollstellungenPage() {
  const [statusFilter, setStatusFilter] = useState<
    "OFFEN" | "TEILWEISE_BEZAHLT" | "BEZAHLT" | "STORNIERT" | undefined
  >();
  const [showModal, setShowModal] = useState(false);

  const utils = trpc.useUtils();
  const { data: sollstellungen, isLoading } =
    trpc.sollstellungen.list.useQuery({ status: statusFilter });
  const { data: stats } = trpc.sollstellungen.stats.useQuery();

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sollstellungen</h1>
          <p className="mt-2 text-gray-600">
            Verwaltung aller Zahlungsforderungen
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Neue Sollstellung
        </button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Offen</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {stats.offen.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.offen.anzahl} Posten
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Teilweise bezahlt</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {(stats.teilweiseBezahlt.summe - stats.teilweiseBezahlt.gedeckt).toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.teilweiseBezahlt.anzahl} Posten
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Bezahlt (Monat)</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats.bezahlt.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.bezahlt.anzahl} Posten
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded px-3 py-1 text-sm ${
            !statusFilter
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setStatusFilter("OFFEN")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "OFFEN"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Offen
        </button>
        <button
          onClick={() => setStatusFilter("TEILWEISE_BEZAHLT")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "TEILWEISE_BEZAHLT"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Teilweise bezahlt
        </button>
        <button
          onClick={() => setStatusFilter("BEZAHLT")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "BEZAHLT"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Bezahlt
        </button>
      </div>

      {/* Tabelle */}
      {sollstellungen && sollstellungen.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Sollstellungen vorhanden
          </h3>
          <p className="mt-2 text-gray-600">
            Erstellen Sie die erste Sollstellung oder generieren Sie Warmmieten
            automatisch.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Titel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mieter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fällig
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Betrag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gedeckt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sollstellungen?.map((soll: any) => (
                <tr key={soll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{soll.titel}</div>
                    {soll.typ === "WARMMIETE" && (
                      <div className="text-xs text-gray-500">
                        K: {soll.kaltmiete || '0.00'} € | BK:{" "}
                        {soll.bkVorauszahlung || '0.00'} € | HK:{" "}
                        {soll.hkVorauszahlung || '0.00'} €
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {soll.mietverhaeltnis?.mieter.nachname || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {soll.typ}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(soll.faelligkeitsdatum).toLocaleDateString(
                      "de-DE"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {soll.betragGesamt} €
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">
                    {soll.gedecktGesamt} €
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        soll.status === "OFFEN"
                          ? "bg-red-100 text-red-800"
                          : soll.status === "TEILWEISE_BEZAHLT"
                            ? "bg-orange-100 text-orange-800"
                            : soll.status === "BEZAHLT"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {soll.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NeueSollstellungModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          void utils.sollstellungen.list.invalidate();
          void utils.sollstellungen.stats.invalidate();
        }}
      />
    </div>
  );
}
