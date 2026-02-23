"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefillMietverhaeltnisId?: string;
}

const MAHNSTUFE_LABELS: Record<string, string> = {
  ERINNERUNG: "Zahlungserinnerung",
  MAHNUNG_1: "1. Mahnung",
  MAHNUNG_2: "2. Mahnung",
  MAHNUNG_3: "3. Mahnung (letzte)",
};

export function MahnungErstellenModal({ open, onClose, onSuccess, prefillMietverhaeltnisId }: Props) {
  const [selectedId, setSelectedId] = useState(prefillMietverhaeltnisId ?? "");
  const [mahnstufe, setMahnstufe] = useState("MAHNUNG_1");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const utils = trpc.useUtils();
  const { data: vorschlaege, isLoading } = trpc.mahnungen.vorschlaege.useQuery();
  const erstellenMutation = trpc.mahnungen.erstellen.useMutation({
    onSuccess: () => {
      setSuccess(true);
      utils.mahnungen.list.invalidate();
      utils.reporting.dashboardKPIs.invalidate();
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    },
    onError: (err) => setError(err.message),
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!selectedId) {
      setError("Bitte ein Mietverhältnis auswählen");
      return;
    }
    setError(null);
    erstellenMutation.mutate({
      mietverhaeltnisId: selectedId,
      mahnstufe: mahnstufe as any,
      dokumentGenerieren: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Mahnung erstellen</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-700">
            Mahnung erfolgreich erstellt!
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mietverhältnis</label>
              {isLoading ? (
                <p className="text-sm text-gray-500">Lade Vorschläge...</p>
              ) : (
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Mietverhältnis wählen --</option>
                  {vorschlaege?.map((v: any) => (
                    <option key={v.mietverhaeltnisId} value={v.mietverhaeltnisId}>
                      {v.mieter.nachname} – {v.objekt.bezeichnung} / {v.einheit.einheitNr} ({v.offenerBetrag.toFixed(2)} € offen)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mahnstufe</label>
              <select
                value={mahnstufe}
                onChange={(e) => setMahnstufe(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                {Object.entries(MAHNSTUFE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={erstellenMutation.isPending || !selectedId}
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {erstellenMutation.isPending ? "Erstelle..." : "Mahnung erstellen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
