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
import { Users, Search, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function MieterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typFilter, setTypFilter] = useState<string>("all");

  const { data: mieter, isLoading } = trpc.mieter.list.useQuery();
  const { data: stats } = trpc.mieter.stats.useQuery();

  const filteredMieter = mieter?.filter((m) => {
    const matchesSearch =
      m.nachname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vorname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.firma?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTyp = typFilter === "all" || m.typ === typFilter;

    return matchesSearch && matchesTyp;
  });

  const getTypColor = (typ: string) => {
    switch (typ) {
      case "PRIVAT":
        return "bg-blue-100 text-blue-800";
      case "GEWERBE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypLabel = (typ: string) => {
    switch (typ) {
      case "PRIVAT":
        return "Privat";
      case "GEWERBE":
        return "Gewerbe";
      default:
        return typ;
    }
  };

  const getDisplayName = (m: any) => {
    if (m.typ === "GEWERBE" && m.firma) {
      return m.firma;
    }
    return `${m.vorname || ""} ${m.nachname}`.trim();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Lade Mieter...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mieter</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Mieter und deren Kontaktdaten
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gesamt Mieter
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gesamt}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Privat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.privat}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gewerbe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.gewerbe}
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
                placeholder="Suche nach Name, Firma oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typFilter} onValueChange={setTypFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="PRIVAT">Privat</SelectItem>
                <SelectItem value="GEWERBE">Gewerbe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mieter List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMieter?.map((m) => (
          <Card key={m.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {getDisplayName(m)}
                  </CardTitle>
                  {m.typ === "GEWERBE" && m.vorname && m.nachname && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ansprechpartner: {m.vorname} {m.nachname}
                    </p>
                  )}
                </div>
                <Badge className={getTypColor(m.typ)}>
                  {getTypLabel(m.typ)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {m.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{m.email}</span>
                  </div>
                )}
                {m.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{m.telefon}</span>
                  </div>
                )}
                {(m.strasse || m.plz || m.ort) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      {m.strasse && <div>{m.strasse}</div>}
                      {(m.plz || m.ort) && (
                        <div>
                          {m.plz} {m.ort}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {m.notizen && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {m.notizen}
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  Details ansehen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMieter?.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Keine Mieter gefunden
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
