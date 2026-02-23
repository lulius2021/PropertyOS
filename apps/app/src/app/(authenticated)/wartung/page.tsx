"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

const KATEGORIEN = ["HEIZUNG", "AUFZUG", "BRANDSCHUTZ", "RAUCHWARNMELDER", "ELEKTRIK", "SANITAER", "DACH", "AUFZUG_TUV", "SONSTIGES"];

const daysUntil = (date: Date | string) => {
  const d = new Date(date);
  const today = new Date();
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function WartungPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bezeichnung: "", kategorie: "", intervallMonate: 12,
    naechsteFaelligkeit: new Date().toISOString().split("T")[0],
    verantwortlicher: "", notiz: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: aufgaben, isLoading, refetch } = trpc.wartung.list.useQuery();
  const { data: faellig7 } = trpc.wartung.listFaelligIn.useQuery({ tage: 7 });
  const { data: faellig30 } = trpc.wartung.listFaelligIn.useQuery({ tage: 30 });

  const createMutation = trpc.wartung.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setSuccessMsg("Aufgabe erstellt"); } });
  const erledigtMutation = trpc.wartung.erledigt.useMutation({ onSuccess: () => { refetch(); setSuccessMsg("Aufgabe als erledigt markiert"); } });
  const deleteMutation = trpc.wartung.delete.useMutation({ onSuccess: () => refetch() });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        naechsteFaelligkeit: new Date(form.naechsteFaelligkeit),
      });
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  if (isLoading) return <div className="p-8">Laden...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wartungsplan</h1>
          <p className="mt-2 text-gray-600">Pflichtprüfungen und Wartungsintervalle verwalten</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + Neue Aufgabe
        </button>
      </div>

      {successMsg && <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{successMsg}</div>}
      {errorMsg && <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorMsg}</div>}

      {/* Fristen-Widget */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className={`rounded-lg border p-4 ${faellig7?.length ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}>
          <div className="text-sm font-medium text-gray-700">Fällig in 7 Tagen</div>
          <div className={`mt-1 text-2xl font-bold ${faellig7?.length ? "text-red-600" : "text-gray-900"}`}>{faellig7?.length || 0}</div>
        </div>
        <div className={`rounded-lg border p-4 ${(faellig30?.length || 0) > (faellig7?.length || 0) ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}>
          <div className="text-sm font-medium text-gray-700">Fällig in 30 Tagen</div>
          <div className={`mt-1 text-2xl font-bold ${(faellig30?.length || 0) > (faellig7?.length || 0) ? "text-orange-600" : "text-gray-900"}`}>{faellig30?.length || 0}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">Neue Wartungsaufgabe</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bezeichnung *</label>
              <input required value={form.bezeichnung} onChange={(e) => setForm({ ...form, bezeichnung: e.target.value })}
                placeholder="z.B. Heizungswartung"
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kategorie *</label>
              <select required value={form.kategorie} onChange={(e) => setForm({ ...form, kategorie: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="">Auswählen...</option>
                {KATEGORIEN.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Intervall (Monate)</label>
              <input type="number" min={1} value={form.intervallMonate} onChange={(e) => setForm({ ...form, intervallMonate: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nächste Fälligkeit</label>
              <input type="date" value={form.naechsteFaelligkeit} onChange={(e) => setForm({ ...form, naechsteFaelligkeit: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verantwortlicher</label>
              <input value={form.verantwortlicher} onChange={(e) => setForm({ ...form, verantwortlicher: e.target.value })}
                className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={createMutation.isPending} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {createMutation.isPending ? "Erstelle..." : "Erstellen"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {!aufgaben?.length ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">Keine Wartungsaufgaben</h3>
            <p className="mt-2 text-gray-600">Erstellen Sie Ihre ersten Wartungsintervalle.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Aufgabe</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kategorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nächste Fälligkeit</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Intervall</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {aufgaben.map((a: any) => {
                const days = daysUntil(a.naechsteFaelligkeit);
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{a.bezeichnung}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{a.kategorie}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{new Date(a.naechsteFaelligkeit).toLocaleDateString("de-DE")}</div>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${days <= 7 ? "bg-red-100 text-red-800" : days <= 30 ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}`}>
                        {days <= 0 ? "Überfällig" : `in ${days} Tagen`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">alle {a.intervallMonate} Monate</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => erledigtMutation.mutate({ id: a.id })} disabled={erledigtMutation.isPending}
                        className="mr-2 text-sm text-green-600 hover:text-green-800">Erledigt</button>
                      <button onClick={() => confirm("Löschen?") && deleteMutation.mutate({ id: a.id })}
                        className="text-sm text-red-600 hover:text-red-800">Löschen</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
