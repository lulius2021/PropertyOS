"use client";

import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  ENTWURF: "Entwurf",
  BERECHNET: "Berechnet",
  FREIGEGEBEN: "Freigegeben",
  VERSENDET: "Versendet",
  ABGESCHLOSSEN: "Abgeschlossen",
};

const STATUS_COLORS: Record<string, string> = {
  ENTWURF: "bg-gray-100 text-gray-800",
  BERECHNET: "bg-blue-100 text-blue-800",
  FREIGEGEBEN: "bg-green-100 text-green-800",
  VERSENDET: "bg-purple-100 text-purple-800",
  ABGESCHLOSSEN: "bg-gray-200 text-gray-600",
};

export default function NebenkostenabrechnungPage() {
  const { data: nkAs, isLoading } = trpc.nebenkostenabrechnung.list.useQuery();

  if (isLoading) return <div className="p-8">Laden...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nebenkostenabrechnung</h1>
          <p className="mt-2 text-gray-600">Jahresabrechnungen für Ihre Objekte</p>
        </div>
        <Link href="/nebenkostenabrechnung/neu"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Neue Abrechnung
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {!nkAs?.length ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">Keine Abrechnungen</h3>
            <p className="mt-2 text-gray-600">Erstellen Sie Ihre erste Nebenkostenabrechnung.</p>
            <Link href="/nebenkostenabrechnung/neu" className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Jetzt erstellen
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Objekt</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Jahr</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Zeitraum</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Gesamtkosten</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Positionen</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {nkAs.map((nka: any) => (
                <tr key={nka.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{nka.objekt?.bezeichnung}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{nka.abrechnungsjahr}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(nka.vonDatum).toLocaleDateString("de-DE")} – {new Date(nka.bisDatum).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {nka.gesamtkosten ? `${parseFloat(nka.gesamtkosten).toFixed(2)} €` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${STATUS_COLORS[nka.status] || "bg-gray-100 text-gray-800"}`}>
                      {STATUS_LABELS[nka.status] || nka.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {nka._count?.positionen || 0} Positionen, {nka._count?.mieterpositionen || 0} Mieter
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/nebenkostenabrechnung/${nka.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
