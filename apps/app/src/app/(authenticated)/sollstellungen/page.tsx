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
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Sollstellungen</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
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
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Offen</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {stats.offen.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {stats.offen.anzahl} Posten
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Teilweise bezahlt</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {(stats.teilweiseBezahlt.summe - stats.teilweiseBezahlt.gedeckt).toFixed(2)} €
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {stats.teilweiseBezahlt.anzahl} Posten
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
            <div className="text-sm text-[var(--text-secondary)]">Bezahlt (Monat)</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {stats.bezahlt.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
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
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setStatusFilter("OFFEN")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "OFFEN"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Offen
        </button>
        <button
          onClick={() => setStatusFilter("TEILWEISE_BEZAHLT")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "TEILWEISE_BEZAHLT"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Teilweise bezahlt
        </button>
        <button
          onClick={() => setStatusFilter("BEZAHLT")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "BEZAHLT"
              ? "bg-blue-600 text-white"
              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
          }`}
        >
          Bezahlt
        </button>
      </div>

      {/* Tabelle */}
      {sollstellungen && sollstellungen.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-page)] p-12 text-center">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">
            Keine Sollstellungen vorhanden
          </h3>
          <p className="mt-2 text-[var(--text-secondary)]">
            Erstellen Sie die erste Sollstellung oder generieren Sie Warmmieten
            automatisch.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--bg-page)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Titel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Mieter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Fällig
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Betrag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Gedeckt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-card)]">
              {sollstellungen?.map((soll: any) => (
                <tr key={soll.id} className="hover:bg-[var(--bg-card-hover)]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{soll.titel}</div>
                    {soll.typ === "WARMMIETE" && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        K: {soll.kaltmiete || '0.00'} € | BK:{" "}
                        {soll.bkVorauszahlung || '0.00'} € | HK:{" "}
                        {soll.hkVorauszahlung || '0.00'} €
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {soll.mietverhaeltnis?.mieter.nachname || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {soll.typ}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {new Date(soll.faelligkeitsdatum).toLocaleDateString(
                      "de-DE"
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--text-primary)]">
                    {soll.betragGesamt} €
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600">
                    {soll.gedecktGesamt} €
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        soll.status === "OFFEN"
                          ? "bg-red-500/15 text-red-400"
                          : soll.status === "TEILWEISE_BEZAHLT"
                            ? "bg-orange-500/15 text-orange-400"
                            : soll.status === "BEZAHLT"
                              ? "bg-green-500/15 text-green-400"
                              : "bg-[var(--bg-card-hover)] text-[var(--text-secondary)]"
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
