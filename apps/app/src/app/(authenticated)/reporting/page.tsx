"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import * as XLSX from "xlsx";

export default function ReportingPage() {
  const [exporting, setExporting] = useState(false);

  const { data: monatsuebersicht } = trpc.reporting.monatsuebersicht.useQuery();
  const { data: statusquoten } = trpc.reporting.statusquoten.useQuery();
  const { data: portfolioData } = trpc.reporting.portfolioExport.useQuery();

  const handleExportExcel = () => {
    if (!portfolioData) return;

    setExporting(true);

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(portfolioData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Portfolio");

      // Generate Excel file
      XLSX.writeFile(wb, `Portfolio_${new Date().toISOString().substring(0, 10)}.xlsx`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!portfolioData) return;

    setExporting(true);

    try {
      // Create CSV headers
      const headers = Object.keys(portfolioData[0] || {});
      const csvContent = [
        headers.join(";"),
        ...portfolioData.map((row) =>
          headers.map((h) => (row as any)[h] || "").join(";")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Portfolio_${new Date().toISOString().substring(0, 10)}.csv`;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reporting & Statistik</h1>
          <p className="mt-2 text-gray-600">
            Auswertungen und Portfolio-Exporte
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!portfolioData || exporting}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {exporting ? "Exportiere..." : "CSV Export"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!portfolioData || exporting}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {exporting ? "Exportiere..." : "Excel Export"}
          </button>
        </div>
      </div>

      {/* Soll/Ist Monatsübersicht */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Soll/Ist Übersicht (Letzte 12 Monate)
        </h2>
        {monatsuebersicht && monatsuebersicht.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monatsuebersicht}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monat" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="soll"
                stroke="#3b82f6"
                name="Soll (€)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="ist"
                stroke="#10b981"
                name="Ist (€)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Keine Daten verfügbar</p>
        )}
      </div>

      {/* Statusquoten */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Einheiten nach Status
          </h2>
          {statusquoten?.einheiten && statusquoten.einheiten.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusquoten.einheiten}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="anzahl" fill="#3b82f6" name="Anzahl" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Keine Daten verfügbar</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tickets nach Status
          </h2>
          {statusquoten?.tickets && statusquoten.tickets.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusquoten.tickets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="anzahl" fill="#f59e0b" name="Anzahl" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Keine Daten verfügbar</p>
          )}
        </div>
      </div>

      {/* Portfolio Preview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Portfolio-Übersicht
        </h2>
        {portfolioData && portfolioData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Objekt
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Einheit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Typ
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fläche (m²)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kaltmiete
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {portfolioData.slice(0, 10).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.objektBezeichnung}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.einheitNr}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {item.einheitTyp}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {item.flaeche}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {item.status}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                      {item.kaltmiete} €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {portfolioData.length > 10 && (
              <p className="mt-4 text-sm text-gray-500">
                Zeige 10 von {portfolioData.length} Einheiten. Nutze Export für vollständige Liste.
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Keine Daten verfügbar</p>
        )}
      </div>
    </div>
  );
}
