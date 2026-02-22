"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const getTypColor = (typ: string) => {
  switch (typ) {
    case "STROM":
      return "bg-yellow-100 text-yellow-800";
    case "GAS":
      return "bg-orange-100 text-orange-800";
    case "WASSER_KALT":
      return "bg-blue-100 text-blue-800";
    case "WASSER_WARM":
      return "bg-red-100 text-red-800";
    case "WAERME":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ablesungsTypOptions = ["REGULAER", "EINZUG", "AUSZUG"] as const;

export default function ZaehlerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const today = new Date().toISOString().split("T")[0];
  const [datum, setDatum] = useState(today);
  const [stand, setStand] = useState("");
  const [ablesesTyp, setAblesesTyp] = useState<(typeof ablesungsTypOptions)[number]>("REGULAER");
  const [notiz, setNotiz] = useState("");

  const utils = trpc.useUtils();

  const { data: zaehler, isLoading, error } = trpc.zaehler.getById.useQuery({ id });

  const erfasseStandMutation = trpc.zaehler.erfasseStand.useMutation({
    onSuccess: () => {
      utils.zaehler.getById.invalidate({ id });
      setStand("");
      setNotiz("");
      setAblesesTyp("REGULAER");
      setDatum(new Date().toISOString().split("T")[0]);
    },
    onError: (err) => {
      alert("Fehler: " + err.message);
    },
  });

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Fehler: {error.message}</div>;
  }

  if (!zaehler) {
    return <div className="p-4 text-gray-600">Zaehler nicht gefunden.</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stand || !datum) return;
    erfasseStandMutation.mutate({
      zaehlerId: zaehler.id,
      datum: new Date(datum),
      stand: parseFloat(stand),
      ablesesTyp,
      notiz: notiz || undefined,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/zaehler")}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Zurueck zu Zaehler
        </button>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getTypColor(zaehler.typ)}`}
        >
          {zaehler.typ}
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Zaehler {zaehler.zaehlernummer}
        </h1>
      </div>

      {/* Info: Objekt / Einheit */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-medium uppercase text-gray-500 mb-2">
          Zuordnung
        </div>
        <div className="flex gap-4">
          {zaehler.objekt && (
            <button
              onClick={() => router.push(`/objekte/${zaehler.objekt!.id}`)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Objekt: {zaehler.objekt.bezeichnung} &rarr;
            </button>
          )}
          {zaehler.einheit && (
            <button
              onClick={() => router.push(`/einheiten/${zaehler.einheit!.id}`)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Einheit: {zaehler.einheit.einheitNr} &rarr;
            </button>
          )}
          {!zaehler.objekt && !zaehler.einheit && (
            <span className="text-sm text-gray-500">Keine Zuordnung</span>
          )}
        </div>
      </div>

      {/* Ablese-Historie */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ablese-Historie</h2>
        </div>
        {zaehler.ablesungen && zaehler.ablesungen.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Notiz
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zaehler.ablesungen.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(a.datum).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {typeof a.stand === "object" && a.stand !== null
                      ? a.stand.toNumber()
                      : a.stand}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                      {a.ablesesTyp}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {a.notiz || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            Noch keine Ablesungen vorhanden.
          </div>
        )}
      </div>

      {/* Neuen Zaehlerstand erfassen */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Neuen Zaehlerstand erfassen
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stand
              </label>
              <input
                type="number"
                step="0.01"
                value={stand}
                onChange={(e) => setStand(e.target.value)}
                placeholder="z.B. 12345.67"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                value={ablesesTyp}
                onChange={(e) =>
                  setAblesesTyp(e.target.value as (typeof ablesungsTypOptions)[number])
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {ablesungsTypOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notiz (optional)
              </label>
              <input
                type="text"
                value={notiz}
                onChange={(e) => setNotiz(e.target.value)}
                placeholder="Bemerkung..."
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={erfasseStandMutation.isPending || !stand || !datum}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {erfasseStandMutation.isPending ? "Speichern..." : "Zaehlerstand erfassen"}
          </button>
        </form>
      </div>
    </div>
  );
}
