"use client";

import { trpc } from "@/lib/trpc/client";
import { Building2, Plus, Pencil, Search } from "lucide-react";
import { useState } from "react";
import { NeueEinheitModal } from "@/components/einheiten/NeueEinheitModal";
import { EinheitBearbeitenModal } from "@/components/einheiten/EinheitBearbeitenModal";

type Einheit = {
  id: string;
  einheitNr: string;
  typ: "WOHNUNG" | "GEWERBE" | "STELLPLATZ" | "LAGER";
  flaeche: string;
  zimmer?: number | null;
  etage?: number | null;
  eurProQm?: string | null;
  ausstattung?: string | null;
  status: string;
  objektId: string | null;
  objekt?: { bezeichnung: string } | null;
};

export default function EinheitenPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedObjekte, setSelectedObjekte] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEinheit, setEditingEinheit] = useState<Einheit | null>(null);

  const { data: einheiten, isLoading } = trpc.einheiten.list.useQuery({});
  const { data: stats } = trpc.einheiten.stats.useQuery(undefined);
  const { data: objekte } = trpc.objekte.list.useQuery();

  const filteredEinheiten = einheiten?.filter((einheit) => {
    const matchesSearch =
      einheit.einheitNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      einheit.objekt?.bezeichnung
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || einheit.status === statusFilter;

    const matchesObjekt =
      selectedObjekte.length === 0 ||
      (einheit.objektId && selectedObjekte.includes(einheit.objektId));

    return matchesSearch && matchesStatus && matchesObjekt;
  });

  const toggleObjekt = (objektId: string) => {
    setSelectedObjekte((prev) =>
      prev.includes(objektId)
        ? prev.filter((id) => id !== objektId)
        : [...prev, objektId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERMIETET":
        return "bg-green-100 text-green-800";
      case "VERFUEGBAR":
        return "bg-blue-100 text-blue-800";
      case "KUENDIGUNG":
        return "bg-yellow-100 text-yellow-800";
      case "SANIERUNG":
        return "bg-orange-100 text-orange-800";
      case "RESERVIERT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Lade Einheiten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Einheiten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Wohn- und Gewerbeeinheiten
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Neue Einheit
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">Gesamt Einheiten</div>
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{stats.gesamt}</div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600">Verfügbar</div>
            <div className="mt-2 text-2xl font-bold text-blue-600">
              {stats.verfuegbar}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600">Vermietet</div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {stats.vermietet}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600">Durchschnitt €/m²</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{stats.durchschnittEurProQm}</div>
          </div>
        </div>
      )}

      {/* Objekt Filter */}
      {objekte && objekte.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Nach Objekt filtern</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {objekte.map((objekt) => {
                const isSelected = selectedObjekte.includes(objekt.id);
                const einheitenCount = einheiten?.filter((e) => e.objektId === objekt.id).length || 0;

                return (
                  <button
                    key={objekt.id}
                    onClick={() => toggleObjekt(objekt.id)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>{objekt.bezeichnung}</span>
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {einheitenCount}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedObjekte.length > 0 && (
              <button
                onClick={() => setSelectedObjekte([])}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Alle Filter zurücksetzen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Suche nach Einheit oder Objekt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Alle Status</option>
            <option value="VERFUEGBAR">Verfügbar</option>
            <option value="VERMIETET">Vermietet</option>
            <option value="KUENDIGUNG">Kündigung</option>
            <option value="SANIERUNG">Sanierung</option>
            <option value="RESERVIERT">Reserviert</option>
          </select>
        </div>
      </div>

      {/* Einheiten List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEinheiten?.map((einheit) => (
          <div key={einheit.id} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {einheit.objekt?.bezeichnung}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Einheit {einheit.einheitNr}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(einheit.status)}`}>
                  {getStatusLabel(einheit.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Typ:</span>
                  <span className="font-medium text-gray-900">
                    {getTypLabel(einheit.typ)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fläche:</span>
                  <span className="font-medium text-gray-900">{einheit.flaeche} m²</span>
                </div>
                {einheit.zimmer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zimmer:</span>
                    <span className="font-medium text-gray-900">{einheit.zimmer}</span>
                  </div>
                )}
                {einheit.etage !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Etage:</span>
                    <span className="font-medium text-gray-900">{einheit.etage}</span>
                  </div>
                )}
                {einheit.eurProQm && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">€/m²:</span>
                    <span className="font-medium text-gray-900">{einheit.eurProQm}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                <button className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Details ansehen
                </button>
                <button
                  onClick={() => setEditingEinheit(einheit as Einheit)}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEinheiten?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
          <div className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Keine Einheiten gefunden</p>
            <p className="text-sm text-gray-400 mt-1">
              Erstellen Sie Ihre erste Einheit mit dem Button oben rechts.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <NeueEinheitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {}}
      />
      <EinheitBearbeitenModal
        isOpen={editingEinheit !== null}
        einheit={editingEinheit}
        onClose={() => setEditingEinheit(null)}
        onSuccess={() => {}}
      />
    </div>
  );
}
