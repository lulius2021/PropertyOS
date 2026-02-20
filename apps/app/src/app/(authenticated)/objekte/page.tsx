"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ViewToggle } from "@/components/objekte/ViewToggle";
import { ObjektCard } from "@/components/objekte/ObjektCard";
import { ErweiterterObjektModal } from "@/components/objekte/ErweiterterObjektModal";

export default function ObjektePage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: objekte, isLoading } = trpc.objekte.list.useQuery();
  const [view, setView] = useState<"table" | "grid">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <div>Laden...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Objekte</h1>
          <p className="mt-2 text-gray-600">Verwaltung aller Immobilienobjekte</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Neues Objekt
          </button>
        </div>
      </div>

      {objekte && objekte.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">Keine Objekte vorhanden</h3>
          <p className="mt-2 text-gray-600">
            Erstellen Sie Ihr erstes Objekt, um zu beginnen.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Objekt erstellen
          </button>
        </div>
      ) : view === "grid" ? (
        // Finder-Ansicht mit Karten
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {objekte?.map((objekt) => (
            <ObjektCard
              key={objekt.id}
              objekt={objekt}
              onClick={() => router.push(`/objekte/${objekt.id}`)}
            />
          ))}
        </div>
      ) : (
        // Tabellenansicht
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Bezeichnung
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Art
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Einheiten
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {objekte?.map((objekt) => (
                <tr key={objekt.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{objekt.bezeichnung}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {objekt.strasse}, {objekt.plz} {objekt.ort}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {objekt.objektart}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {objekt._count.einheiten}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => router.push(`/objekte/${objekt.id}`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Neues Objekt Modal */}
      <ErweiterterObjektModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh die Liste
          utils.objekte.list.invalidate();
        }}
      />
    </div>
  );
}
