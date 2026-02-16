"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

export default function MahnungenPage() {
  const [showVorschlaege, setShowVorschlaege] = useState(true);

  const { data: mahnungen, isLoading, refetch } = trpc.mahnungen.list.useQuery();
  const { data: vorschlaege, isLoading: vorschlaegeLoading } =
    trpc.mahnungen.vorschlaege.useQuery();
  const { data: stats } = trpc.mahnungen.stats.useQuery();

  const erstellenMutation = trpc.mahnungen.erstellen.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleErstellen = async (
    mietverhaeltnisId: string,
    mahnstufe: "ERINNERUNG" | "MAHNUNG_1" | "MAHNUNG_2" | "MAHNUNG_3"
  ) => {
    if (
      confirm(
        `Möchten Sie wirklich eine ${mahnstufe} für dieses Mietverhältnis erstellen?`
      )
    ) {
      try {
        await erstellenMutation.mutateAsync({
          mietverhaeltnisId,
          mahnstufe,
          dokumentGenerieren: true,
        });
        alert("Mahnung erfolgreich erstellt!");
      } catch (error) {
        alert(`Fehler: ${(error as Error).message}`);
      }
    }
  };

  if (isLoading || vorschlaegeLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mahnwesen</h1>
          <p className="mt-2 text-gray-600">
            Verwaltung von Mahnungen und Zahlungserinnerungen
          </p>
        </div>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Offene Mahnungen</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.offen.anzahl}
            </div>
            <div className="text-xs text-gray-500">
              {stats.offen.summe.toFixed(2)} €
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Versendet</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.versendet.anzahl}
            </div>
            <div className="text-xs text-gray-500">
              {stats.versendet.summe.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowVorschlaege(true)}
          className={`rounded px-4 py-2 text-sm font-medium ${
            showVorschlaege
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vorschläge ({vorschlaege?.length || 0})
        </button>
        <button
          onClick={() => setShowVorschlaege(false)}
          className={`rounded px-4 py-2 text-sm font-medium ${
            !showVorschlaege
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle Mahnungen ({mahnungen?.length || 0})
        </button>
      </div>

      {/* Mahnvorschläge */}
      {showVorschlaege && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {vorschlaege && vorschlaege.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Keine Mahnvorschläge
              </h3>
              <p className="mt-2 text-gray-600">
                Aktuell gibt es keine überfälligen Zahlungen.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mieter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Objekt / Einheit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Offener Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tage überfällig
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Empfohlen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {vorschlaege?.map((vorschlag: any) => (
                  <tr key={vorschlag.mietverhaeltnisId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {vorschlag.mieter.nachname}
                      </div>
                      {vorschlag.mieter.firma && (
                        <div className="text-xs text-gray-500">
                          {vorschlag.mieter.firma}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vorschlag.objekt.bezeichnung} - {vorschlag.einheit.einheitNr}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">
                      {vorschlag.offenerBetrag.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                        {vorschlag.tageUeberfaellig} Tage
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {vorschlag.empfohleneStufe}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleErstellen(
                            vorschlag.mietverhaeltnisId,
                            vorschlag.empfohleneStufe
                          )
                        }
                        disabled={erstellenMutation.isPending}
                        className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
                      >
                        {erstellenMutation.isPending ? "..." : "Erstellen"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Alle Mahnungen */}
      {!showVorschlaege && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {mahnungen && mahnungen.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Keine Mahnungen vorhanden
              </h3>
              <p className="mt-2 text-gray-600">
                Es wurden noch keine Mahnungen erstellt.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mahnstufe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Offener Betrag
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gebühren
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dokument
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mahnungen?.map((mahnung: any) => (
                  <tr key={mahnung.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {mahnung.mahnstufe}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(mahnung.mahnDatum).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {mahnung.offenerBetrag} €
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {(parseFloat(mahnung.mahngebuehr) + parseFloat(mahnung.verzugszinsen)).toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          mahnung.status === "OFFEN"
                            ? "bg-orange-100 text-orange-800"
                            : mahnung.status === "VERSENDET"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {mahnung.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {mahnung.dokumentGeneriert ? (
                        <span className="text-green-600">✓ Generiert</span>
                      ) : (
                        <span className="text-gray-400">Nicht generiert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
