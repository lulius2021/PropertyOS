"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NKANeuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    objektId: "",
    abrechnungsjahr: new Date().getFullYear() - 1,
    vonDatum: `${new Date().getFullYear() - 1}-01-01`,
    bisDatum: `${new Date().getFullYear() - 1}-12-31`,
    notiz: "",
  });
  const [error, setError] = useState("");

  const { data: objekte } = trpc.objekte.list.useQuery();
  const createMutation = trpc.nebenkostenabrechnung.create.useMutation({
    onSuccess: (nka) => router.push(`/nebenkostenabrechnung/${nka.id}`),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.objektId) { setError("Bitte wählen Sie ein Objekt."); return; }
    await createMutation.mutateAsync({
      objektId: form.objektId,
      abrechnungsjahr: form.abrechnungsjahr,
      vonDatum: new Date(form.vonDatum),
      bisDatum: new Date(form.bisDatum),
      notiz: form.notiz || undefined,
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Neue Nebenkostenabrechnung</h1>
        <p className="mt-2 text-gray-600">Abrechnungszeitraum und Objekt auswählen</p>
      </div>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Objekt *</label>
          <select required value={form.objektId} onChange={(e) => setForm({ ...form, objektId: e.target.value })}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Objekt auswählen...</option>
            {objekte?.map((o: any) => (
              <option key={o.id} value={o.id}>{o.bezeichnung} — {o.strasse}, {o.ort}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Abrechnungsjahr</label>
          <input type="number" value={form.abrechnungsjahr}
            onChange={(e) => {
              const jahr = parseInt(e.target.value);
              setForm({ ...form, abrechnungsjahr: jahr, vonDatum: `${jahr}-01-01`, bisDatum: `${jahr}-12-31` });
            }}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Von</label>
            <input type="date" value={form.vonDatum} onChange={(e) => setForm({ ...form, vonDatum: e.target.value })}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bis</label>
            <input type="date" value={form.bisDatum} onChange={(e) => setForm({ ...form, bisDatum: e.target.value })}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notiz (optional)</label>
          <textarea value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} rows={2}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {createMutation.isPending ? "Erstelle..." : "Abrechnung erstellen"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}
