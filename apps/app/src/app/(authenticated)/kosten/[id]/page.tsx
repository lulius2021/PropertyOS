"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function KostenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kostenId = params.id as string;

  const [showZahlungDialog, setShowZahlungDialog] = useState(false);
  const [zahlungData, setZahlungData] = useState({
    datum: "",
    betrag: "",
    notiz: "",
  });

  const { data: kosten, isLoading, refetch } = trpc.kosten.getKostenById.useQuery({
    id: kostenId,
  });

  const createZahlungMutation = trpc.kosten.createKostenZahlung.useMutation({
    onSuccess: () => {
      refetch();
      setShowZahlungDialog(false);
      setZahlungData({ datum: "", betrag: "", notiz: "" });
    },
  });

  const deleteZahlungMutation = trpc.kosten.deleteKostenZahlung.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateZahlung = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createZahlungMutation.mutateAsync({
        kostenId,
        datum: new Date(zahlungData.datum),
        betrag: parseFloat(zahlungData.betrag),
        notiz: zahlungData.notiz || undefined,
      });
      alert("Zahlung erfolgreich erfasst!");
    } catch (error) {
      alert(`Fehler: ${(error as Error).message}`);
    }
  };

  const handleDeleteZahlung = async (id: string) => {
    if (confirm("Möchten Sie diese Zahlung wirklich löschen?")) {
      try {
        await deleteZahlungMutation.mutateAsync({ id });
        alert("Zahlung gelöscht!");
      } catch (error) {
        alert(`Fehler: ${(error as Error).message}`);
      }
    }
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (!kosten) {
    return <div>Kosten nicht gefunden</div>;
  }

  const getZahlungsstatusBadge = () => {
    if (kosten.ueberfaellig) {
      return (
        <Badge variant="destructive">
          Überfällig
        </Badge>
      );
    }
    switch (kosten.zahlungsstatus) {
      case "BEZAHLT":
        return <Badge className="bg-green-100 text-green-800">Bezahlt</Badge>;
      case "TEILBEZAHLT":
        return <Badge className="bg-yellow-100 text-yellow-800">Teilbezahlt</Badge>;
      case "OFFEN":
        return <Badge className="bg-orange-100 text-orange-800">Offen</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            ← Zurück
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            {kosten.lieferant}
          </h1>
          <p className="mt-2 text-gray-600">{kosten.kategorie}</p>
        </div>
        {kosten.zahlungsstatus !== "BEZAHLT" && (
          <Button onClick={() => setShowZahlungDialog(true)}>
            + Zahlung erfassen
          </Button>
        )}
      </div>

      {/* Stammdaten */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Rechnungsbetrag</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {parseFloat(kosten.betragBrutto).toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Gezahlt</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">
            {kosten.summeZahlungen.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Restbetrag</div>
          <div className="mt-1 text-2xl font-bold text-orange-600">
            {kosten.restbetrag.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Zahlungsstatus</div>
          <div className="mt-1">{getZahlungsstatusBadge()}</div>
        </Card>
      </div>

      {/* Details */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xl font-bold">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Kostendatum</div>
            <div className="font-medium">
              {new Date(kosten.datum).toLocaleDateString("de-DE")}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rechnungsdatum</div>
            <div className="font-medium">
              {kosten.rechnungsdatum
                ? new Date(kosten.rechnungsdatum).toLocaleDateString("de-DE")
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Fälligkeitsdatum</div>
            <div className="font-medium">
              {kosten.faelligkeitsdatum
                ? new Date(kosten.faelligkeitsdatum).toLocaleDateString("de-DE")
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rechnungsnummer</div>
            <div className="font-medium">{kosten.rechnungsnummer || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Lieferantenreferenz</div>
            <div className="font-medium">{kosten.lieferantenRef || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Relevanz</div>
            <div className="flex gap-1">
              {kosten.bkRelevant && (
                <Badge className="bg-blue-100 text-blue-800">BK</Badge>
              )}
              {kosten.hkRelevant && (
                <Badge className="bg-orange-100 text-orange-800">HK</Badge>
              )}
              {!kosten.bkRelevant && !kosten.hkRelevant && (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
        {kosten.beschreibung && (
          <div className="mt-4">
            <div className="text-sm text-gray-500">Beschreibung</div>
            <div className="mt-1 whitespace-pre-wrap">{kosten.beschreibung}</div>
          </div>
        )}
      </Card>

      {/* Zahlungen */}
      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold">Zahlungen</h2>
          {kosten.zahlungen && kosten.zahlungen.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Notiz
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {kosten.zahlungen.map((zahlung: any) => (
                  <tr key={zahlung.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(zahlung.datum).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {parseFloat(zahlung.betrag).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {zahlung.notiz || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteZahlung(zahlung.id)}
                      >
                        Löschen
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Noch keine Zahlungen erfasst
            </div>
          )}
        </div>
      </Card>

      {/* Dialog für Zahlung */}
      {showZahlungDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Zahlung erfassen</h2>
            <form onSubmit={handleCreateZahlung}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Zahlungsdatum *
                  </label>
                  <Input
                    type="date"
                    required
                    value={zahlungData.datum}
                    onChange={(e) =>
                      setZahlungData({
                        ...zahlungData,
                        datum: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Betrag * (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={zahlungData.betrag}
                    onChange={(e) =>
                      setZahlungData({
                        ...zahlungData,
                        betrag: e.target.value,
                      })
                    }
                    placeholder={`Max: ${kosten.restbetrag.toFixed(2)} €`}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Restbetrag: {kosten.restbetrag.toFixed(2)} €
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notiz
                  </label>
                  <textarea
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    rows={2}
                    value={zahlungData.notiz}
                    onChange={(e) =>
                      setZahlungData({
                        ...zahlungData,
                        notiz: e.target.value,
                      })
                    }
                    placeholder="Optional..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowZahlungDialog(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={createZahlungMutation.isPending}
                >
                  {createZahlungMutation.isPending
                    ? "Speichern..."
                    : "Speichern"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
