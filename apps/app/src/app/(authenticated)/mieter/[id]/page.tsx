"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ErweiterterMieterModal } from "@/components/mieter/ErweiterterMieterModal";

export default function MieterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const mieterId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: mieter, isLoading } = trpc.mieter.getById.useQuery({ id: mieterId });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!mieter) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Mieter nicht gefunden</h2>
          <button
            onClick={() => router.push("/mieter")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const displayName = mieter.firma || `${mieter.vorname || ""} ${mieter.nachname}`.trim();
  const aktiveMietverhaeltnisse = mieter.mietverhaeltnisse?.filter((mv: any) => !mv.auszugsdatum) || [];
  const fruehereMietverhaeltnisse = mieter.mietverhaeltnisse?.filter((mv: any) => mv.auszugsdatum) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/mieter")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück
        </button>
      </div>

      {/* Mieter-Übersicht */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <span className="text-2xl font-semibold">
                  {displayName[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                {mieter.firma && mieter.vorname && mieter.nachname && (
                  <p className="mt-1 text-lg text-gray-600">
                    Ansprechpartner: {mieter.vorname} {mieter.nachname}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    mieter.typ === "PRIVAT" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {mieter.typ === "PRIVAT" ? "Privat" : "Geschäftlich"}
                  </span>
                  {aktiveMietverhaeltnisse.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      Aktiver Mieter
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Mieter bearbeiten
            </button>
          </div>
        </div>

        {/* Kontaktdaten */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Kontaktdaten</h3>
            <div className="space-y-2 text-sm">
              {mieter.email && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{mieter.email}</span>
                </div>
              )}
              {mieter.telefonMobil && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{mieter.telefonMobil} (Mobil)</span>
                </div>
              )}
              {mieter.telefonFestnetz && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{mieter.telefonFestnetz} (Festnetz)</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Adresse</h3>
            <div className="text-sm text-gray-700">
              {mieter.strasse && <div>{mieter.strasse} {mieter.hausnummer}</div>}
              {(mieter.plz || mieter.ort) && <div>{mieter.plz} {mieter.ort}</div>}
              {mieter.land && <div>{mieter.land}</div>}
              {!mieter.strasse && !mieter.plz && <span className="text-gray-400">Keine Adresse hinterlegt</span>}
            </div>
          </div>

          {mieter.geburtsdatum && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Geburtsdatum</h3>
              <div className="text-sm text-gray-700">
                {new Date(mieter.geburtsdatum).toLocaleDateString("de-DE")}
              </div>
            </div>
          )}

          {mieter.notfallkontaktName && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notfallkontakt</h3>
              <div className="text-sm text-gray-700">
                <div>{mieter.notfallkontaktName}</div>
                {mieter.notfallkontaktBeziehung && <div className="text-gray-500">{mieter.notfallkontaktBeziehung}</div>}
                {mieter.notfallkontaktTelefon && <div>{mieter.notfallkontaktTelefon}</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aktive Mietverhältnisse */}
      {aktiveMietverhaeltnisse.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktive Mietverhältnisse</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {aktiveMietverhaeltnisse.map((mv: any) => (
              <div key={mv.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {mv.einheit.objekt?.bezeichnung} - Einheit {mv.einheit.einheitNr}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {mv.einheit.objekt?.strasse}, {mv.einheit.objekt?.plz} {mv.einheit.objekt?.ort}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Aktiv
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Einzug</span>
                    <div className="font-semibold text-gray-900">
                      {new Date(mv.einzugsdatum).toLocaleDateString("de-DE")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kaltmiete</span>
                    <div className="font-semibold text-gray-900">
                      {parseFloat(mv.kaltmiete).toFixed(2)} €
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Nebenkosten</span>
                    <div className="font-semibold text-gray-900">
                      {parseFloat(mv.bkVorauszahlung).toFixed(2)} €
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Warmmiete</span>
                    <div className="font-semibold text-blue-600">
                      {(parseFloat(mv.kaltmiete) + parseFloat(mv.bkVorauszahlung) + parseFloat(mv.hkVorauszahlung)).toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frühere Mietverhältnisse */}
      {fruehereMietverhaeltnisse.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Frühere Mietverhältnisse</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {fruehereMietverhaeltnisse.map((mv: any) => (
              <div key={mv.id} className="p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      {mv.einheit.objekt?.bezeichnung} - Einheit {mv.einheit.einheitNr}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(mv.einzugsdatum).toLocaleDateString("de-DE")} - {new Date(mv.auszugsdatum).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Beendet
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Dauer</span>
                    <div className="font-semibold text-gray-700">
                      {Math.round((new Date(mv.auszugsdatum).getTime() - new Date(mv.einzugsdatum).getTime()) / (1000 * 60 * 60 * 24 * 30))} Monate
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Letzte Kaltmiete</span>
                    <div className="font-semibold text-gray-700">
                      {parseFloat(mv.kaltmiete).toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notizen */}
      {mieter.notizen && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Notizen</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{mieter.notizen}</p>
        </div>
      )}

      {/* Modal */}
      <ErweiterterMieterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          utils.mieter.getById.invalidate({ id: mieterId });
        }}
        mieterId={mieterId}
      />
    </div>
  );
}
