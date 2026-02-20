"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";

interface CsvRow {
  datum: Date;
  betrag: number;
  verwendungszweck: string;
  iban?: string;
}

function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Detect separator
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/"/g, ""));
    if (cols.every((c) => !c)) continue;

    const get = (keys: string[]) => {
      for (const k of keys) {
        const idx = headers.findIndex((h) => h.includes(k));
        if (idx !== -1) return cols[idx] ?? "";
      }
      return "";
    };

    const datumStr = get(["datum", "date", "buchungstag", "valuta"]);
    const betragStr = get(["betrag", "amount", "umsatz"]).replace(/\./g, "").replace(",", ".");
    const vz = get(["verwendungszweck", "zweck", "betreff", "purpose", "beschreibung"]);
    const iban = get(["iban", "kontonr", "konto"]);

    if (!datumStr || !betragStr) continue;

    // Parse German date format: dd.mm.yyyy
    let datum: Date;
    if (datumStr.includes(".")) {
      const [d, m, y] = datumStr.split(".");
      datum = new Date(`${y}-${m?.padStart(2, "0")}-${d?.padStart(2, "0")}`);
    } else {
      datum = new Date(datumStr);
    }

    const betrag = parseFloat(betragStr);
    if (isNaN(datum.getTime()) || isNaN(betrag)) continue;

    rows.push({ datum, betrag, verwendungszweck: vz || "-", iban: iban || undefined });
  }

  return rows;
}

export default function BankImportPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<CsvRow[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [autoMatch, setAutoMatch] = useState(true);

  const importMutation = trpc.bank.importCSV.useMutation({
    onSuccess: (data) => {
      router.push(`/bank?imported=${data.importiert}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setError("Keine gültigen Zeilen gefunden. Bitte CSV-Format prüfen.");
          setPreview(null);
        } else {
          setPreview(rows);
        }
      } catch {
        setError("CSV-Datei konnte nicht gelesen werden.");
        setPreview(null);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleImport = () => {
    if (!preview) return;
    importMutation.mutate({ zahlungen: preview, autoMatch });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CSV-Import</h1>
          <p className="mt-1 text-sm text-gray-600">
            Bankumsätze als CSV-Datei importieren
          </p>
        </div>
        <Link
          href="/bank"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Zurück
        </Link>
      </div>

      {/* Upload */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">CSV-Datei auswählen</h2>
        <p className="mb-4 text-sm text-gray-600">
          Unterstützte Formate: Komma- oder Semikolon-getrennt. Erwartete Spalten:{" "}
          <code className="rounded bg-gray-100 px-1">Datum</code>,{" "}
          <code className="rounded bg-gray-100 px-1">Betrag</code>,{" "}
          <code className="rounded bg-gray-100 px-1">Verwendungszweck</code>,{" "}
          <code className="rounded bg-gray-100 px-1">IBAN</code> (optional)
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 hover:bg-gray-100">
          <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {fileName ? fileName : "CSV-Datei auswählen oder hierher ziehen"}
          </span>
          <span className="mt-1 text-xs text-gray-500">.csv</span>
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </label>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Vorschau – {preview.length} Zahlungen erkannt
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoMatch}
                onChange={(e) => setAutoMatch(e.target.checked)}
                className="rounded"
              />
              Auto-Match nach Import
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Datum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Betrag</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Verwendungszweck</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">IBAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {preview.slice(0, 20).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {row.datum.toLocaleDateString("de-DE")}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${row.betrag >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {row.betrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-sm truncate">{row.verwendungszweck}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.iban || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.length > 20 && (
            <p className="px-6 py-3 text-xs text-gray-500">
              … und {preview.length - 20} weitere Einträge
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={() => { setPreview(null); setFileName(""); }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {importMutation.isPending ? "Importieren…" : `${preview.length} Zahlungen importieren`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
