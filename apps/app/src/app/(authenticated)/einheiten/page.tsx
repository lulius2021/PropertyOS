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
import { Building2, Search } from "lucide-react";
import { useState } from "react";

export default function EinheitenPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: einheiten, isLoading } = trpc.einheiten.list.useQuery();
  const { data: stats } = trpc.einheiten.stats.useQuery();

  const filteredEinheiten = einheiten?.filter((einheit) => {
    const matchesSearch =
      einheit.einheitNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      einheit.objekt?.bezeichnung
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || einheit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      case "WOHNUNG":
        return "Wohnung";
      case "GEWERBE":
        return "Gewerbe";
      case "STELLPLATZ":
        return "Stellplatz";
      case "LAGER":
        return "Lager";
      default:
        return typ;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VERMIETET":
        return "Vermietet";
      case "VERFUEGBAR":
        return "Verfügbar";
      case "KUENDIGUNG":
        return "Kündigung";
      case "SANIERUNG":
        return "Sanierung";
      case "RESERVIERT":
        return "Reserviert";
      default:
        return status;
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
      <div>
        <h1 className="text-3xl font-bold">Einheiten</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Wohn- und Gewerbeeinheiten
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gesamt Einheiten
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gesamt}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.verfuegbar}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vermietet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.vermietet}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Durchschnitt €/m²
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.durchschnittEurProQm}</div>
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
                placeholder="Suche nach Einheit oder Objekt..."
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
                <SelectItem value="VERFUEGBAR">Verfügbar</SelectItem>
                <SelectItem value="VERMIETET">Vermietet</SelectItem>
                <SelectItem value="KUENDIGUNG">Kündigung</SelectItem>
                <SelectItem value="SANIERUNG">Sanierung</SelectItem>
                <SelectItem value="RESERVIERT">Reserviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Einheiten List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEinheiten?.map((einheit) => (
          <Card key={einheit.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {einheit.objekt?.bezeichnung}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Einheit {einheit.einheitNr}
                  </p>
                </div>
                <Badge className={getStatusColor(einheit.status)}>
                  {getStatusLabel(einheit.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Typ:</span>
                  <span className="font-medium">
                    {getTypLabel(einheit.typ)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fläche:</span>
                  <span className="font-medium">{einheit.flaeche} m²</span>
                </div>
                {einheit.zimmer && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zimmer:</span>
                    <span className="font-medium">{einheit.zimmer}</span>
                  </div>
                )}
                {einheit.etage !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Etage:</span>
                    <span className="font-medium">{einheit.etage}</span>
                  </div>
                )}
                {einheit.eurProQm && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">€/m²:</span>
                    <span className="font-medium">{einheit.eurProQm}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  Details ansehen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEinheiten?.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Keine Einheiten gefunden
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
