"use client";

import { trpc } from "@/lib/trpc/client";

interface VerlaufModalProps {
  widgetTyp: string;
  widgetName: string;
  onClose: () => void;
}

const TYP_DOT: Record<string, string> = {
  zahlung: "bg-green-500",
  ticket: "bg-red-500",
  einheit: "bg-blue-500",
  kosten: "bg-orange-500",
  kredit: "bg-violet-500",
  zaehler: "bg-teal-500",
  miete: "bg-indigo-500",
  objekt: "bg-gray-400",
};

const STATUS_STYLE: Record<string, string> = {
  UNKLAR: "text-orange-600",
  ZUGEORDNET: "text-green-600",
  TEILWEISE_ZUGEORDNET: "text-yellow-600",
  IGNORIERT: "text-gray-400",
  SPLITTET: "text-blue-600",
  ERFASST: "text-gray-600",
  IN_BEARBEITUNG: "text-blue-600",
  ZUR_PRUEFUNG: "text-yellow-600",
  ABGESCHLOSSEN: "text-green-600",
  VERFUEGBAR: "text-gray-600",
  VERMIETET: "text-green-600",
  KUENDIGUNG: "text-orange-600",
  SANIERUNG: "text-yellow-600",
  RESERVIERT: "text-blue-600",
};

const STATUS_LABEL: Record<string, string> = {
  UNKLAR: "Unklar",
  ZUGEORDNET: "Zugeordnet",
  TEILWEISE_ZUGEORDNET: "Teilw. zugeordnet",
  IGNORIERT: "Ignoriert",
  SPLITTET: "Gesplittet",
  ERFASST: "Erfasst",
  IN_BEARBEITUNG: "In Bearbeitung",
  ZUR_PRUEFUNG: "Zur Prüfung",
  ABGESCHLOSSEN: "Abgeschlossen",
  VERFUEGBAR: "Verfügbar",
  VERMIETET: "Vermietet",
  KUENDIGUNG: "Kündigung",
  SANIERUNG: "Sanierung",
  RESERVIERT: "Reserviert",
};

function formatDatum(isoString: string) {
  const d = new Date(isoString);
  return {
    datum: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }),
    uhrzeit: d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function VerlaufModal({ widgetTyp, widgetName, onClose }: VerlaufModalProps) {
  const { data, isLoading } = trpc.statistik.verlauf.useQuery({ widgetTyp });
  const { data: snapshots, isLoading: snapshotsLoading } = trpc.statistik.kpiVerlauf.useQuery({ widgetTyp });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Verlauf</h2>
            <p className="text-sm text-gray-500">{widgetName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Statistik-Verlauf (Snapshots) ── */}
          {(snapshotsLoading || (snapshots && snapshots.length > 0)) && (
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Wert-Verlauf
              </h3>
              {snapshotsLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
                  Lade...
                </div>
              ) : (
                <div className="space-y-0">
                  {snapshots!.map((snap, idx) => {
                    const { datum, uhrzeit } = formatDatum(snap.datum);
                    const prev = snapshots![idx + 1];
                    const delta = prev && snap.wertZahl != null && prev.wertZahl != null
                      ? snap.wertZahl - prev.wertZahl
                      : null;
                    const isLast = idx === snapshots!.length - 1;

                    return (
                      <div key={snap.id} className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                          {!isLast && <div className="w-px flex-1 bg-gray-200" style={{ minHeight: 16 }} />}
                        </div>
                        {/* Content */}
                        <div className="flex-1 pb-3 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-gray-900">{snap.wertText}</span>
                            {delta !== null && (
                              <span className={`text-xs font-semibold flex-shrink-0 ${delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-gray-400"}`}>
                                {delta > 0 ? "+" : ""}{delta.toLocaleString("de-DE", { maximumFractionDigits: 1 })}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400">{datum} · {uhrzeit} Uhr</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Ereignis-Verlauf (Transaktionen) ── */}
          <div className="px-6 py-4">
          {snapshots && snapshots.length > 0 && (
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Ereignisse
            </h3>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            </div>
          ) : !data?.eintraege?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Noch keine Einträge</p>
              <p className="mt-1 text-xs text-gray-400">Änderungen erscheinen hier sobald Daten vorhanden sind.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {data.eintraege.map((eintrag, idx) => {
                const { datum, uhrzeit } = formatDatum(eintrag.datum);
                const dotColor = TYP_DOT[eintrag.typ] ?? "bg-gray-400";
                const statusLabel = eintrag.status ? STATUS_LABEL[eintrag.status] : null;
                const statusColor = eintrag.status ? STATUS_STYLE[eintrag.status] : null;
                const isLast = idx === data.eintraege.length - 1;

                return (
                  <div key={eintrag.id} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${dotColor}`} />
                      {!isLast && (
                        <div className="w-px flex-1 bg-gray-200" style={{ minHeight: 20 }} />
                      )}
                    </div>

                    {/* Entry content */}
                    <div className={`pb-4 flex-1 min-w-0`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">{eintrag.titel}</p>
                        {statusLabel && statusColor && (
                          <span className={`flex-shrink-0 text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{eintrag.beschreibung}</p>
                      <p className="mt-1 text-xs text-gray-400">{datum} · {uhrzeit} Uhr</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-3">
          <p className="text-center text-xs text-gray-400">
            Zeigt die letzten 50 Einträge
          </p>
        </div>
      </div>
    </>
  );
}
