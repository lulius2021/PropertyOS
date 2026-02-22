"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { EinheitBearbeitenModal } from "@/components/einheiten/EinheitBearbeitenModal";
import { NeuerVertragModal } from "@/components/vertraege/NeuerVertragModal";

export default function EinheitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const id = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVertragModalOpen, setIsVertragModalOpen] = useState(false);

  const { data: einheit, isLoading } = trpc.einheiten.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-500">Laden...</div>
      </div>
    );
  }

  if (!einheit) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Einheit nicht gefunden</h2>
          <button
            onClick={() => router.push("/einheiten")}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const aktiveMV = einheit.mietverhaeltnisse?.find(
    (mv) => !mv.auszugsdatum
  );

  const getTypLabel = (typ: string) => {
    switch (typ) {
      case "WOHNUNG": return "Wohnung";
      case "GEWERBE": return "Gewerbe";
      case "STELLPLATZ": return "Stellplatz";
      case "LAGER": return "Lager";
      default: return typ;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERMIETET":
        return "bg-green-100 text-green-800";
      case "VERFUEGBAR":
        return "bg-yellow-100 text-yellow-800";
      case "KUENDIGUNG":
        return "bg-orange-100 text-orange-800";
      case "SANIERUNG":
        return "bg-red-100 text-red-800";
      case "RESERVIERT":
        return "bg-purple-100 text-purple-800";
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

  const kaltmiete = aktiveMV ? parseFloat(aktiveMV.kaltmiete.toString()) : 0;
  const bk = aktiveMV ? parseFloat(aktiveMV.bkVorauszahlung.toString()) : 0;
  const hk = aktiveMV ? parseFloat(aktiveMV.hkVorauszahlung.toString()) : 0;
  const warmmiete = kaltmiete + bk + hk;
  const flaeche = parseFloat(einheit.flaeche.toString());
  const kaltmieteProQm = flaeche > 0 ? (kaltmiete / flaeche).toFixed(2) : "–";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/objekte/${einheit.objektId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zu {einheit.objekt?.bezeichnung}
        </button>
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Bearbeiten
        </button>
      </div>

      {/* Einheit title */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Einheit {einheit.einheitNr}
              </h1>
              <p className="mt-1 text-gray-600">
                {einheit.objekt?.bezeichnung}
              </p>
            </div>
            <span
              className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(einheit.status)}`}
            >
              {getStatusLabel(einheit.status)}
            </span>
          </div>
        </div>

        {/* Stammdaten */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Stammdaten</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-gray-500">Typ</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{getTypLabel(einheit.typ)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Etage</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {einheit.etage !== null && einheit.etage !== undefined
                  ? einheit.etage === 0 ? "EG" : `${einheit.etage}. OG`
                  : "–"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Fläche</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{einheit.flaeche.toString()} m²</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Zimmer</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{einheit.zimmer ?? "–"}</dd>
            </div>
            {einheit.ausstattung && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-sm text-gray-500">Ausstattung</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900 whitespace-pre-wrap">
                  {einheit.ausstattung}
                </dd>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aktives Mietverhältnis */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Aktives Mietverhältnis</h2>
        </div>

        {aktiveMV ? (
          <div className="px-6 py-5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-gray-500">Mieter</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {aktiveMV.mieter.firma
                    ? aktiveMV.mieter.firma
                    : `${aktiveMV.mieter.vorname ?? ""} ${aktiveMV.mieter.nachname}`.trim()}
                </dd>
              </div>
              {aktiveMV.mieter.email && (
                <div>
                  <dt className="text-sm text-gray-500">E-Mail</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{aktiveMV.mieter.email}</dd>
                </div>
              )}
              {aktiveMV.mieter.telefon && (
                <div>
                  <dt className="text-sm text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">{aktiveMV.mieter.telefon}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Einzugsdatum</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {new Date(aktiveMV.einzugsdatum).toLocaleDateString("de-DE")}
                </dd>
              </div>
            </div>

            <hr className="my-5 border-gray-200" />

            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Mietzahlungen</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="text-sm text-gray-500">Kaltmiete</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {kaltmiete.toFixed(2)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">BK-Vorauszahlung</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {bk.toFixed(2)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">HK-Vorauszahlung</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {hk.toFixed(2)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Warmmiete</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">
                  {warmmiete.toFixed(2)} €
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Kaltmiete/m²</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {kaltmieteProQm} €
                </dd>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Kein aktives Mietverhältnis</h3>
            <p className="mt-1 text-sm text-gray-500">
              Diese Einheit ist derzeit nicht vermietet.
            </p>
            <button
              onClick={() => setIsVertragModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Mietverhältnis anlegen
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EinheitBearbeitenModal
        isOpen={isEditModalOpen}
        einheit={
          isEditModalOpen
            ? {
                id: einheit.id,
                einheitNr: einheit.einheitNr,
                typ: einheit.typ as "WOHNUNG" | "GEWERBE" | "STELLPLATZ" | "LAGER",
                flaeche: einheit.flaeche.toString(),
                zimmer: einheit.zimmer,
                etage: einheit.etage,
                eurProQm: einheit.eurProQm?.toString() ?? null,
                ausstattung: einheit.ausstattung,
              }
            : null
        }
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          utils.einheiten.getById.invalidate({ id });
        }}
      />
      <NeuerVertragModal
        isOpen={isVertragModalOpen}
        onClose={() => setIsVertragModalOpen(false)}
        onSuccess={() => {
          utils.einheiten.getById.invalidate({ id });
        }}
        defaultEinheitId={einheit.id}
      />
    </div>
  );
}
