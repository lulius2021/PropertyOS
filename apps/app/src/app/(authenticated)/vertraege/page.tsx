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

  const { data: vertraege, isLoading } = trpc.vertraege.list.useQuery();
  const { data: stats } = trpc.vertraege.stats.useQuery();

  const filteredVertraege = vertraege?.filter((v) => {
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

    return matchesSearch && matchesStatus;
  });

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gesamt Verträge
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gesamt}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.aktiv}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Warmmiete Gesamt
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gesamtWarmmiete}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ø Warmmiete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.durchschnittWarmmiete}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Mieter, Einheit oder Objekt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="ENTWURF">Entwurf</SelectItem>
                <SelectItem value="GENERIERT">Generiert</SelectItem>
                <SelectItem value="VERSANDT">Versandt</SelectItem>
                <SelectItem value="UNTERSCHRIEBEN">Unterschrieben</SelectItem>
                <SelectItem value="AKTIV">Aktiv</SelectItem>
                <SelectItem value="BEENDET">Beendet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vertraege List */}
      <div className="space-y-4">
        {filteredVertraege?.map((v) => {
          const warmmiete =
            parseFloat(v.kaltmiete) +
            parseFloat(v.bkVorauszahlung) +
            parseFloat(v.hkVorauszahlung);

          return (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {getMieterName(v.mieter)}
                      </CardTitle>
                      <Badge className={getStatusColor(v.vertragStatus)}>
                        {getStatusLabel(v.vertragStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {v.einheit?.objekt?.bezeichnung} • Einheit{" "}
                      {v.einheit?.einheitNr}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {warmmiete.toFixed(2)} €
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Warmmiete
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Kaltmiete</div>
                    <div className="font-medium">{v.kaltmiete} €</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">
                      BK-Vorauszahlung
                    </div>
                    <div className="font-medium">{v.bkVorauszahlung} €</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">
                      HK-Vorauszahlung
                    </div>
                    <div className="font-medium">{v.hkVorauszahlung} €</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Kaution</div>
                    <div className="font-medium">
                      {v.kaution ? `${v.kaution} €` : "-"}
                    </div>
                    {v.kaution && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {getKautionStatusLabel(v.kautionStatus)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Einzug</div>
                      <div className="font-medium">
                        {format(new Date(v.einzugsdatum), "dd.MM.yyyy", {
                          locale: de,
                        })}
                      </div>
                    </div>
                  </div>
                  {v.auszugsdatum && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">Auszug</div>
                        <div className="font-medium">
                          {format(new Date(v.auszugsdatum), "dd.MM.yyyy", {
                            locale: de,
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    Details ansehen
                  </Button>
                  <Button variant="outline" size="sm">
                    Vertrag generieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVertraege?.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Keine Mietverträge gefunden
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
