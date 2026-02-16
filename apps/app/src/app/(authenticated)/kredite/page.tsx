"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function KreditePage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    bezeichnung: "",
    bank: "",
    referenznummer: "",
    startdatum: "",
    auszahlungsdatum: "",
    ursprungsbetrag: "",
    rate: "",
    zinssatz: "",
    laufzeitMonate: "",
    zinsbindungBis: "",
    laufzeitEnde: "",
    zahlungsfrequenz: "MONATLICH",
    notizen: "",
  });

  const { data: kredite, isLoading, refetch } = trpc.kredite.list.useQuery();
  const { data: stats } = trpc.kredite.stats.useQuery();

  const createMutation = trpc.kredite.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowDialog(false);
      setFormData({
        bezeichnung: "",
        bank: "",
        referenznummer: "",
        startdatum: "",
        auszahlungsdatum: "",
        ursprungsbetrag: "",
        rate: "",
        zinssatz: "",
        laufzeitMonate: "",
        zinsbindungBis: "",
        laufzeitEnde: "",
        zahlungsfrequenz: "MONATLICH",
        notizen: "",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        bezeichnung: formData.bezeichnung,
        bank: formData.bank,
        referenznummer: formData.referenznummer || undefined,
        startdatum: new Date(formData.startdatum),
        auszahlungsdatum: formData.auszahlungsdatum
          ? new Date(formData.auszahlungsdatum)
          : undefined,
        ursprungsbetrag: parseFloat(formData.ursprungsbetrag),
        rate: parseFloat(formData.rate),
        zinssatz: parseFloat(formData.zinssatz) / 100, // Convert % to decimal
        laufzeitMonate: parseInt(formData.laufzeitMonate),
        zinsbindungBis: formData.zinsbindungBis
          ? new Date(formData.zinsbindungBis)
          : undefined,
        laufzeitEnde: formData.laufzeitEnde
          ? new Date(formData.laufzeitEnde)
          : undefined,
        zahlungsfrequenz: formData.zahlungsfrequenz,
        notizen: formData.notizen || undefined,
      });
      alert("Kredit erfolgreich erstellt!");
    } catch (error) {
      alert(`Fehler: ${(error as Error).message}`);
    }
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kreditverwaltung</h1>
          <p className="mt-2 text-gray-600">
            Übersicht über Finanzierungen und Darlehen
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>+ Neues Darlehen</Button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Anzahl Darlehen</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">
              {stats.gesamt}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Restschuld gesamt</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {stats.gesamtRestschuld} €
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Gesamt-Rate (monatlich)</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.gesamtRate} €
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">
              Zinsbindung endet (12 Mon.)
            </div>
            <div className="mt-1 text-2xl font-bold text-orange-600">
              {stats.zinsbindungAuslaufend}
            </div>
          </Card>
        </div>
      )}

      {/* Dialog für neues Darlehen */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Neues Darlehen anlegen</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Grunddaten */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bezeichnung *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.bezeichnung}
                    onChange={(e) =>
                      setFormData({ ...formData, bezeichnung: e.target.value })
                    }
                    placeholder="z.B. Objektfinanzierung Musterstraße 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bank *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.bank}
                      onChange={(e) =>
                        setFormData({ ...formData, bank: e.target.value })
                      }
                      placeholder="z.B. Sparkasse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Referenznummer
                    </label>
                    <Input
                      type="text"
                      value={formData.referenznummer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenznummer: e.target.value,
                        })
                      }
                      placeholder="z.B. 123456789"
                    />
                  </div>
                </div>

                {/* Datums-Felder */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Startdatum *
                    </label>
                    <Input
                      type="date"
                      required
                      value={formData.startdatum}
                      onChange={(e) =>
                        setFormData({ ...formData, startdatum: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Auszahlungsdatum
                    </label>
                    <Input
                      type="date"
                      value={formData.auszahlungsdatum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          auszahlungsdatum: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Finanzielle Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ursprungsbetrag * (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.ursprungsbetrag}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ursprungsbetrag: e.target.value,
                        })
                      }
                      placeholder="z.B. 250000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monatliche Rate * (€)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                      placeholder="z.B. 1200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Zinssatz * (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.zinssatz}
                      onChange={(e) =>
                        setFormData({ ...formData, zinssatz: e.target.value })
                      }
                      placeholder="z.B. 3.25"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Laufzeit * (Monate)
                    </label>
                    <Input
                      type="number"
                      required
                      value={formData.laufzeitMonate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          laufzeitMonate: e.target.value,
                        })
                      }
                      placeholder="z.B. 360"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Zinsbindung bis
                    </label>
                    <Input
                      type="date"
                      value={formData.zinsbindungBis}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          zinsbindungBis: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notizen
                  </label>
                  <textarea
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    rows={3}
                    value={formData.notizen}
                    onChange={(e) =>
                      setFormData({ ...formData, notizen: e.target.value })
                    }
                    placeholder="Zusätzliche Informationen..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabelle */}
      {kredite && kredite.length === 0 ? (
        <Card className="border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Darlehen erfasst
          </h3>
          <p className="mt-2 text-gray-600">
            Erfassen Sie Ihre Finanzierungen für bessere Übersicht.
          </p>
          <Button className="mt-4" onClick={() => setShowDialog(true)}>
            Darlehen anlegen
          </Button>
        </Card>
      ) : (
        <Card>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bezeichnung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bank
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ursprungsbetrag
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rate (mtl.)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Zinssatz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Laufzeit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sondertilgungen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {kredite?.map((kredit: any) => (
                <tr
                  key={kredit.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/kredite/${kredit.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {kredit.bezeichnung}
                    </div>
                    {kredit.referenznummer && (
                      <div className="text-xs text-gray-500">
                        Ref: {kredit.referenznummer}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {kredit.bank}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {parseFloat(kredit.ursprungsbetrag).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {parseFloat(kredit.rate).toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {(parseFloat(kredit.zinssatz) * 100).toFixed(2)} %
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {kredit.laufzeitMonate} Monate
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                      {kredit.sondertilgungen?.length || 0}
                    </span>
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
