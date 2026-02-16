"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type FilterZahlungsstatus =
  | "alle"
  | "OFFEN"
  | "TEILBEZAHLT"
  | "BEZAHLT"
  | "UEBERFAELLIG";

export default function KostenPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [jahr, setJahr] = useState(currentYear);
  const [filterTyp, setFilterTyp] = useState<"alle" | "bk" | "hk">("alle");
  const [filterZahlungsstatus, setFilterZahlungsstatus] =
    useState<FilterZahlungsstatus>("alle");

  const { data: kosten, isLoading } = trpc.kosten.listKosten.useQuery({
    jahr,
    bkRelevant: filterTyp === "bk" ? true : undefined,
    hkRelevant: filterTyp === "hk" ? true : undefined,
    zahlungsstatus:
      filterZahlungsstatus === "alle" ? undefined : filterZahlungsstatus,
  });

  const { data: stats } = trpc.kosten.statsKosten.useQuery({ jahr });

  if (isLoading) {
    return <div>Laden...</div>;
  }

  const getZahlungsstatusBadge = (kosten: any) => {
    if (kosten.ueberfaellig) {
      return (
        <Badge variant="destructive" className="text-xs">
          Überfällig
        </Badge>
      );
    }
    switch (kosten.zahlungsstatus) {
      case "BEZAHLT":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">Bezahlt</Badge>
        );
      case "TEILBEZAHLT":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
            Teilbezahlt
          </Badge>
        );
      case "OFFEN":
        return (
          <Badge className="bg-orange-100 text-orange-800 text-xs">Offen</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kosten</h1>
          <p className="mt-2 text-gray-600">
            Erfassung und Verwaltung von Betriebskosten
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + Kosten erfassen
        </button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Gesamt ({jahr})</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats.gesamt.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.gesamt.anzahl} Posten
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Offen</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.offen.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.offen.anzahl} Posten
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Überfällig</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {stats.ueberfaellig.summe.toFixed(2)} €
            </div>
            <div className="text-xs text-gray-500">
              {stats.ueberfaellig.anzahl} Posten
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">BK-relevant</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.bk.toFixed(2)} €
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">HK-relevant</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.hk.toFixed(2)} €
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        {/* Zahlungsstatus Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterZahlungsstatus("alle")}
            className={`rounded px-3 py-1 text-sm ${
              filterZahlungsstatus === "alle"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilterZahlungsstatus("OFFEN")}
            className={`rounded px-3 py-1 text-sm ${
              filterZahlungsstatus === "OFFEN"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Offen
          </button>
          <button
            onClick={() => setFilterZahlungsstatus("UEBERFAELLIG")}
            className={`rounded px-3 py-1 text-sm ${
              filterZahlungsstatus === "UEBERFAELLIG"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Überfällig
          </button>
          <button
            onClick={() => setFilterZahlungsstatus("BEZAHLT")}
            className={`rounded px-3 py-1 text-sm ${
              filterZahlungsstatus === "BEZAHLT"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Bezahlt
          </button>
        </div>

        {/* Relevanz Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterTyp("alle")}
            className={`rounded px-3 py-1 text-sm ${
              filterTyp === "alle"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Alle
          </button>
          <button
            onClick={() => setFilterTyp("bk")}
            className={`rounded px-3 py-1 text-sm ${
              filterTyp === "bk"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            BK
          </button>
          <button
            onClick={() => setFilterTyp("hk")}
            className={`rounded px-3 py-1 text-sm ${
              filterTyp === "hk"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            HK
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Jahr:</label>
          <select
            value={jahr}
            onChange={(e) => setJahr(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabelle */}
      {kosten && kosten.length === 0 ? (
        <Card className="border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Kosten erfasst
          </h3>
          <p className="mt-2 text-gray-600">
            Erfassen Sie die ersten Betriebskosten für {jahr}.
          </p>
          <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Kosten erfassen
          </button>
        </Card>
      ) : (
        <Card>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Lieferant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Betrag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Offen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fällig
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Relevanz
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {kosten?.map((kost: any) => (
                <tr
                  key={kost.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/kosten/${kost.id}`)}
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(kost.datum).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {kost.lieferant}
                    </div>
                    {kost.rechnungsnummer && (
                      <div className="text-xs text-gray-500">
                        RE: {kost.rechnungsnummer}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {kost.kategorie}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {parseFloat(kost.betragBrutto).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-orange-600">
                    {kost.restbetrag > 0 ? `${kost.restbetrag.toFixed(2)} €` : "-"}
                  </td>
                  <td className="px-6 py-4">{getZahlungsstatusBadge(kost)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {kost.faelligkeitsdatum
                      ? new Date(kost.faelligkeitsdatum).toLocaleDateString(
                          "de-DE"
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {kost.bkRelevant && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          BK
                        </Badge>
                      )}
                      {kost.hkRelevant && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          HK
                        </Badge>
                      )}
                      {!kost.bkRelevant && !kost.hkRelevant && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
