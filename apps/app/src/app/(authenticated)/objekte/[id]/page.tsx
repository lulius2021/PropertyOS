"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ObjektImage } from "@/components/objekte/ObjektImage";
import { ErweiterterObjektModal } from "@/components/objekte/ErweiterterObjektModal";
import { MieterZuObjektHinzufuegenModal } from "@/components/mieter/MieterZuObjektHinzufuegenModal";

export default function ObjektDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const objektId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMieterModalOpen, setIsMieterModalOpen] = useState(false);

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

  // Sammle alle Mieter aus den Einheiten
  const alleMieter = objekt.einheiten.flatMap((einheit) =>
    einheit.mietverhaeltnisse.map((mv) => ({
      ...mv.mieter,
      einheitNr: einheit.einheitNr,
      einheitId: einheit.id,
      mietbeginn: mv.einzugsdatum,
    }))
  );

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
                <div className="mt-3 flex items-center gap-4">
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

        {/* Objektdaten */}
        {objekt.notizen && (
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-700">Notizen</h3>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{objekt.notizen}</p>
          </div>
        )}
      </div>

      {/* Mieterübersicht */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Mieter in diesem Objekt ({alleMieter.length})
            </h2>
            <button
              onClick={() => setIsMieterModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Mieter hinzufügen
            </button>
          </div>
        </div>

        {alleMieter.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine aktiven Mietverhältnisse</h3>
            <p className="mt-1 text-sm text-gray-500">
              In diesem Objekt gibt es derzeit keine aktiven Mieter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alleMieter.map((mieter) => (
              <div
                key={`${mieter.id}-${mieter.einheitId}`}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <span className="text-lg font-semibold">
                        {mieter.vorname?.[0] || mieter.nachname[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {mieter.typ === "GESCHAEFTLICH" && mieter.firma ? (
                          <>
                            {mieter.firma}
                            {mieter.vorname && mieter.nachname && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({mieter.vorname} {mieter.nachname})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {mieter.anrede && `${mieter.anrede} `}
                            {mieter.vorname} {mieter.nachname}
                          </>
                        )}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <span>Einheit {mieter.einheitNr}</span>
                        </div>
                        {mieter.mietbeginn && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>
                              Seit {new Date(mieter.mietbeginn).toLocaleDateString("de-DE")}
                            </span>
                          </>
                        )}
                      </div>
                      {mieter.email && (
                        <p className="mt-1 text-sm text-gray-500">{mieter.email}</p>
                      )}
                      {mieter.telefon && (
                        <p className="mt-1 text-sm text-gray-500">{mieter.telefon}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/mieter/${mieter.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bearbeiten-Modal */}
      <ErweiterterObjektModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh die Daten
          utils.objekte.getById.invalidate({ id: objektId });
        }}
        objektId={objektId}
      />

      {/* Mieter hinzufügen Modal */}
      <MieterZuObjektHinzufuegenModal
        isOpen={isMieterModalOpen}
        onClose={() => setIsMieterModalOpen(false)}
        onSuccess={() => {
          // Refresh die Daten
          utils.objekte.getById.invalidate({ id: objektId });
        }}
        objektId={objektId}
      />
    </div>
  );
}
