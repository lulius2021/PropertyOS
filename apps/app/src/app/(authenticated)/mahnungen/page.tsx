"use client";

import { trpc } from "@/lib/trpc/client";
import { useState, useEffect, useRef } from "react";

const MAHNSTUFE_LABELS: Record<string, string> = {
  ERINNERUNG: "Zahlungserinnerung",
  MAHNUNG_1: "1. Mahnung",
  MAHNUNG_2: "2. Mahnung",
  MAHNUNG_3: "3. Mahnung (letzte)",
};

type Tab = "vorschlaege" | "alle" | "zustellprotokoll";

export default function MahnungenPage() {
  const [activeTab, setActiveTab] = useState<Tab>("vorschlaege");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: mahnungen, isLoading, refetch } = trpc.mahnungen.list.useQuery();
  const { data: vorschlaege, isLoading: vorschlaegeLoading } =
    trpc.mahnungen.vorschlaege.useQuery();
  const { data: stats } = trpc.mahnungen.stats.useQuery();

  const erstellenMutation = trpc.mahnungen.erstellen.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateStatusMutation = trpc.mahnungen.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      setOpenDropdownId(null);
    },
  });

  const sperrenMutation = trpc.mahnungen.sperren.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Auto-clear error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleErstellen = async (
    mietverhaeltnisId: string,
    mahnstufe: "ERINNERUNG" | "MAHNUNG_1" | "MAHNUNG_2" | "MAHNUNG_3"
  ) => {
    const label = MAHNSTUFE_LABELS[mahnstufe] ?? mahnstufe;
    if (
      confirm(
        `Möchten Sie wirklich eine ${label} für dieses Mietverhältnis erstellen?`
      )
    ) {
      setSuccessMsg("");
      setErrorMsg("");
      try {
        await erstellenMutation.mutateAsync({
          mietverhaeltnisId,
          mahnstufe,
          dokumentGenerieren: true,
        });
        setSuccessMsg(`${label} erfolgreich erstellt!`);
      } catch (error) {
        setErrorMsg(`Fehler: ${(error as Error).message}`);
      }
    }
  };

  const handleStatusChange = async (mahnungId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: mahnungId, status: newStatus as "STRITTIG" | "INKASSO" });
      setSuccessMsg(`Status auf ${newStatus} geändert.`);
    } catch (error) {
      setErrorMsg(`Fehler: ${(error as Error).message}`);
    }
  };

  const handleSperren = async (mietverhaeltnisId: string) => {
    if (confirm("Mahnvorschlag für dieses Mietverhältnis sperren?")) {
      try {
        await sperrenMutation.mutateAsync({ mietverhaeltnisId });
        setSuccessMsg("Mahnvorschlag gesperrt.");
      } catch (error) {
        setErrorMsg(`Fehler: ${(error as Error).message}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OFFEN":
        return "bg-orange-100 text-orange-800";
      case "VERSENDET":
        return "bg-blue-100 text-blue-800";
      case "BEZAHLT":
        return "bg-green-100 text-green-800";
      case "STORNIERT":
        return "bg-gray-100 text-gray-800";
      case "STRITTIG":
        return "bg-yellow-100 text-yellow-800";
      case "INKASSO":
        return "bg-gray-900 text-white";
      default:
        return "bg-gray-100 text-gray-800";
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

      {/* Inline Success Banner */}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">{successMsg}</p>
        </div>
      )}

      {/* Inline Error Banner */}
      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{errorMsg}</p>
        </div>
      )}

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
          onClick={() => setActiveTab("vorschlaege")}
          className={`rounded px-4 py-2 text-sm font-medium ${
            activeTab === "vorschlaege"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Vorschläge ({vorschlaege?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("alle")}
          className={`rounded px-4 py-2 text-sm font-medium ${
            activeTab === "alle"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle Mahnungen ({mahnungen?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("zustellprotokoll")}
          className={`rounded px-4 py-2 text-sm font-medium ${
            activeTab === "zustellprotokoll"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Zustellprotokoll
        </button>
      </div>

      {/* Mahnvorschläge */}
      {activeTab === "vorschlaege" && (
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
                      {MAHNSTUFE_LABELS[vorschlag.empfohleneStufe] ?? vorschlag.empfohleneStufe}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                        <button
                          onClick={() => handleSperren(vorschlag.mietverhaeltnisId)}
                          disabled={sperrenMutation.isPending}
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Sperren
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Alle Mahnungen */}
      {activeTab === "alle" && (
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
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {mahnungen?.map((mahnung: any) => (
                  <tr key={mahnung.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {MAHNSTUFE_LABELS[mahnung.mahnstufe] ?? mahnung.mahnstufe}
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
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(mahnung.status)}`}
                      >
                        {mahnung.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {mahnung.dokumentGeneriert ? (
                        <span className="text-green-600">Generiert</span>
                      ) : (
                        <span className="text-gray-400">Nicht generiert</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block" ref={openDropdownId === mahnung.id ? dropdownRef : undefined}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === mahnung.id ? null : mahnung.id)}
                          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Status ändern
                        </button>
                        {openDropdownId === mahnung.id && (
                          <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            {["OFFEN", "VERSENDET", "BEZAHLT", "STORNIERT", "STRITTIG", "INKASSO"]
                              .filter((s) => s !== mahnung.status)
                              .map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(mahnung.id, status)}
                                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <span className={`mr-2 inline-block h-2 w-2 rounded-full ${getStatusColor(status).split(" ")[0]}`} />
                                  {status}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Zustellprotokoll */}
      {activeTab === "zustellprotokoll" && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Zustellprotokoll
            </h3>
            <p className="mt-2 text-gray-600">
              Zustellprotokolle werden in einer zukünftigen Version angezeigt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
