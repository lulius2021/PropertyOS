"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Calendar, Euro } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function VertraegePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [laufendFilter, setLaufendFilter] = useState<string>("all");
  const [mieterTypFilter, setMieterTypFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("einzug");
  const [selectedObjekte, setSelectedObjekte] = useState<string[]>([]);

  const { data: vertraege, isLoading } = trpc.vertraege.list.useQuery();
  const { data: stats } = trpc.vertraege.stats.useQuery();
  const { data: objekte } = trpc.objekte.list.useQuery();

  const filteredVertraege = vertraege
    ?.filter((v) => {
      const matchesSearch =
        v.mieter?.nachname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mieter?.vorname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mieter?.firma?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.einheit?.einheitNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.einheit?.objekt?.bezeichnung
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || v.vertragStatus === statusFilter;

      const matchesLaufend =
        laufendFilter === "all" ||
        (laufendFilter === "laufend" && !v.auszugsdatum) ||
        (laufendFilter === "beendet" && v.auszugsdatum);

      const matchesMieterTyp =
        mieterTypFilter === "all" ||
        (mieterTypFilter === "privat" && (v.mieter?.typ === "PRIVAT" || !v.mieter?.typ)) ||
        (mieterTypFilter === "geschaeftlich" && (v.mieter?.typ === "GESCHAEFTLICH" || v.mieter?.typ === "GEWERBE"));

      const matchesObjekt =
        selectedObjekte.length === 0 ||
        (v.einheit?.objektId && selectedObjekte.includes(v.einheit.objektId));

      return matchesSearch && matchesStatus && matchesLaufend && matchesMieterTyp && matchesObjekt;
    })
    .sort((a, b) => {
      if (sortBy === "einzug") {
        return new Date(b.einzugsdatum).getTime() - new Date(a.einzugsdatum).getTime();
      } else if (sortBy === "einzug-alt") {
        return new Date(a.einzugsdatum).getTime() - new Date(b.einzugsdatum).getTime();
      } else if (sortBy === "miete-hoch") {
        const warmmieteA = parseFloat(a.kaltmiete) + parseFloat(a.bkVorauszahlung) + parseFloat(a.hkVorauszahlung);
        const warmmieteB = parseFloat(b.kaltmiete) + parseFloat(b.bkVorauszahlung) + parseFloat(b.hkVorauszahlung);
        return warmmieteB - warmmieteA;
      } else if (sortBy === "miete-niedrig") {
        const warmmieteA = parseFloat(a.kaltmiete) + parseFloat(a.bkVorauszahlung) + parseFloat(a.hkVorauszahlung);
        const warmmieteB = parseFloat(b.kaltmiete) + parseFloat(b.bkVorauszahlung) + parseFloat(b.hkVorauszahlung);
        return warmmieteA - warmmieteB;
      }
      return 0;
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
      case "AKTIV":
        return "bg-green-100 text-green-800";
      case "UNTERSCHRIEBEN":
        return "bg-blue-100 text-blue-800";
      case "VERSANDT":
        return "bg-purple-100 text-purple-800";
      case "GENERIERT":
        return "bg-yellow-100 text-yellow-800";
      case "ENTWURF":
        return "bg-gray-100 text-gray-800";
      case "BEENDET":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AKTIV":
        return "Aktiv";
      case "UNTERSCHRIEBEN":
        return "Unterschrieben";
      case "VERSANDT":
        return "Versandt";
      case "GENERIERT":
        return "Generiert";
      case "ENTWURF":
        return "Entwurf";
      case "BEENDET":
        return "Beendet";
      default:
        return status;
    }
  };

  const getKautionStatusLabel = (status: string) => {
    switch (status) {
      case "AUSSTEHEND":
        return "Ausstehend";
      case "TEILZAHLUNG":
        return "Teilzahlung";
      case "VOLLSTAENDIG":
        return "Vollständig";
      case "HINTERLEGT_BANK":
        return "Bei Bank hinterlegt";
      case "ZURUECKGEZAHLT":
        return "Zurückgezahlt";
      default:
        return status;
    }
  };

  const getMieterName = (mieter: any) => {
    if (mieter.typ === "GEWERBE" && mieter.firma) {
      return mieter.firma;
    }
    return `${mieter.vorname || ""} ${mieter.nachname}`.trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Lade Mietverträge...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mietverträge</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Mietverhältnisse und Verträge
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">Gesamt Verträge</div>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{stats.gesamt}</div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600">Aktiv</div>
            <div className="mt-2 text-2xl font-bold text-green-600">
              {stats.aktiv}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-600">Warmmiete Gesamt</div>
              <Euro className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{stats.gesamtWarmmiete} €</div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-600">Ø Warmmiete</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
              {stats.durchschnittWarmmiete} €
            </div>
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
                const vertraegeCount = vertraege?.filter((v) => v.einheit?.objektId === objekt.id).length || 0;

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
                    <FileText className="h-4 w-4" />
                    <span>{objekt.bezeichnung}</span>
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {vertraegeCount}
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Mieter, Einheit oder Objekt..."
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
              <option value="ENTWURF">Entwurf</option>
              <option value="GENERIERT">Generiert</option>
              <option value="VERSANDT">Versandt</option>
              <option value="UNTERSCHRIEBEN">Unterschrieben</option>
              <option value="AKTIV">Aktiv</option>
              <option value="BEENDET">Beendet</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select
              value={laufendFilter}
              onChange={(e) => setLaufendFilter(e.target.value)}
              className="w-full md:w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Alle Verträge</option>
              <option value="laufend">Laufend</option>
              <option value="beendet">Beendet</option>
            </select>

            <select
              value={mieterTypFilter}
              onChange={(e) => setMieterTypFilter(e.target.value)}
              className="w-full md:w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Alle Mietertypen</option>
              <option value="privat">Privat</option>
              <option value="geschaeftlich">Geschäftlich</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="einzug">Neueste zuerst</option>
              <option value="einzug-alt">Älteste zuerst</option>
              <option value="miete-hoch">Höchste Miete</option>
              <option value="miete-niedrig">Niedrigste Miete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vertraege List */}
      <div className="space-y-4">
        {filteredVertraege?.map((v) => {
          const warmmiete =
            parseFloat(v.kaltmiete) +
            parseFloat(v.bkVorauszahlung) +
            parseFloat(v.hkVorauszahlung);

          return (
            <div key={v.id} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getMieterName(v.mieter)}
                      </h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(v.vertragStatus)}`}>
                        {getStatusLabel(v.vertragStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {v.einheit?.objekt?.bezeichnung} • Einheit{" "}
                      {v.einheit?.einheitNr}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {warmmiete.toFixed(2)} €
                    </div>
                    <div className="text-xs text-gray-500">
                      Warmmiete
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Kaltmiete</div>
                    <div className="font-medium text-gray-900">{v.kaltmiete} €</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">
                      BK-Vorauszahlung
                    </div>
                    <div className="font-medium text-gray-900">{v.bkVorauszahlung} €</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">
                      HK-Vorauszahlung
                    </div>
                    <div className="font-medium text-gray-900">{v.hkVorauszahlung} €</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Kaution</div>
                    <div className="font-medium text-gray-900">
                      {v.kaution ? `${v.kaution} €` : "-"}
                    </div>
                    {v.kaution && (
                      <div className="text-xs text-gray-500 mt-1">
                        {getKautionStatusLabel(v.kautionStatus)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-gray-600">Einzug</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(v.einzugsdatum), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </div>
                    </div>
                  </div>
                  {v.auszugsdatum && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-gray-600">Auszug</div>
                        <div className="font-medium text-gray-900">
                          {format(new Date(v.auszugsdatum), "dd.MM.yyyy", {
                            locale: de,
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  <button className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Details ansehen
                  </button>
                  <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Vertrag generieren
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVertraege?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-8">
          <div className="text-center text-gray-500">
            Keine Mietverträge gefunden
          </div>
        </div>
      )}
    </div>
  );
}
