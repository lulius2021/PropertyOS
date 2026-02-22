"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ObjektImage } from "@/components/objekte/ObjektImage";
import { ErweiterterObjektModal } from "@/components/objekte/ErweiterterObjektModal";
import { NeueEinheitModal } from "@/components/einheiten/NeueEinheitModal";

export default function ObjektDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const objektId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEinheitModalOpen, setIsEinheitModalOpen] = useState(false);

  const { data: objekt, isLoading } = trpc.objekte.getById.useQuery({ id: objektId });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!objekt) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Objekt nicht gefunden</h2>
          <button
            onClick={() => router.push("/objekte")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERMIETET":
        return "bg-green-100 text-green-800";
      case "VERFUEGBAR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VERMIETET": return "Vermietet";
      case "VERFUEGBAR": return "Verfügbar";
      case "KUENDIGUNG": return "Kündigung";
      case "SANIERUNG": return "Sanierung";
      case "RESERVIERT": return "Reserviert";
      default: return status;
    }
  };

  const getTypLabel = (typ: string) => {
    switch (typ) {
      case "WOHNUNG": return "Wohnung";
      case "GEWERBE": return "Gewerbe";
      case "STELLPLATZ": return "Stellplatz";
      case "LAGER": return "Lager";
      default: return typ;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/objekte")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
      </div>

      {/* Objektübersicht */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Objekt-Bild */}
              <ObjektImage
                bildUrl={objekt.bildUrl}
                alt={objekt.bezeichnung}
                size="large"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{objekt.bezeichnung}</h1>
                <p className="mt-1 text-lg text-gray-600">
                  {objekt.strasse}, {objekt.plz} {objekt.ort}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {objekt.objektart}
                  </span>
                  <span className="text-sm text-gray-600">
                    {objekt.einheiten.length} Einheiten
                  </span>
                  {objekt.gesamtflaeche && (
                    <span className="text-sm text-gray-600">
                      {objekt.gesamtflaeche.toString()} m²
                    </span>
                  )}
                  {objekt.baujahr && (
                    <span className="text-sm text-gray-600">
                      Baujahr {objekt.baujahr}
                    </span>
                  )}
                  {objekt.heizungsart && (
                    <span className="text-sm text-gray-600">
                      {objekt.heizungsart}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Objekt bearbeiten
            </button>
          </div>
        </div>

        {/* Notizen */}
        {objekt.notizen && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-700">Notizen</h3>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{objekt.notizen}</p>
          </div>
        )}
      </div>

      {/* Einheiten */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Einheiten ({objekt.einheiten.length})
            </h2>
            <button
              onClick={() => setIsEinheitModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Neue Einheit
            </button>
          </div>
        </div>

        {objekt.einheiten.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Einheiten vorhanden</h3>
            <p className="mt-1 text-sm text-gray-500">
              Erstellen Sie die erste Einheit für dieses Objekt.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Einheit-Nr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fläche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Zimmer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aktueller Mieter
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {objekt.einheiten.map((einheit) => {
                  const aktiveMV = einheit.mietverhaeltnisse?.find(
                    (mv) => !mv.auszugsdatum
                  );
                  const mieterName = aktiveMV
                    ? aktiveMV.mieter.firma
                      ? aktiveMV.mieter.firma
                      : `${aktiveMV.mieter.vorname ?? ""} ${aktiveMV.mieter.nachname}`.trim()
                    : "Leer";

                  return (
                    <tr
                      key={einheit.id}
                      onClick={() => router.push(`/einheiten/${einheit.id}`)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {einheit.einheitNr}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {getTypLabel(einheit.typ)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {einheit.flaeche.toString()} m²
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {einheit.zimmer ?? "–"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(einheit.status)}`}
                        >
                          {getStatusLabel(einheit.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {mieterName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bearbeiten-Modal */}
      <ErweiterterObjektModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          utils.objekte.getById.invalidate({ id: objektId });
        }}
        objektId={objektId}
      />

      {/* Neue Einheit Modal */}
      <NeueEinheitModal
        isOpen={isEinheitModalOpen}
        onClose={() => setIsEinheitModalOpen(false)}
        onSuccess={() => {
          utils.objekte.getById.invalidate({ id: objektId });
        }}
        defaultObjektId={objekt.id}
      />
    </div>
  );
}
