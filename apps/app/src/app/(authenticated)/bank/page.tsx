"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { PlanLimitReached } from "@/components/ui/PlanLimitReached";

export default function BankPage() {
  const [statusFilter, setStatusFilter] = useState<
    | "UNKLAR"
    | "ZUGEORDNET"
    | "TEILWEISE_ZUGEORDNET"
    | "IGNORIERT"
    | "SPLITTET"
    | undefined
  >("UNKLAR");

  const { data: zahlungen, isLoading, refetch, error } =
    trpc.bank.listZahlungen.useQuery({ status: statusFilter });

  const autoMatchMutation = trpc.bank.autoMatchAlle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const ignorierenMutation = trpc.bank.ignorieren.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Plan-Gate: Feature nicht verfügbar
  if (error?.data?.code === "FORBIDDEN") {
    return (
      <div className="mx-auto max-w-lg mt-12">
        <PlanLimitReached
          feature="bankImport"
          message={error.message}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div>Laden...</div>;
  }

  const unklareZahlungen =
    zahlungen?.filter((z: { status: string }) => z.status === "UNKLAR") || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bankimport</h1>
          <p className="mt-2 text-gray-600">
            Zahlungen importieren und zuordnen
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => autoMatchMutation.mutate()}
            disabled={autoMatchMutation.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {autoMatchMutation.isPending ? "Matching..." : "Auto-Match"}
          </button>
          <Link
            href="/bank/import"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            CSV importieren
          </Link>
        </div>
      </div>

      {/* Unklar Badge */}
      {unklareZahlungen.length > 0 && (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                {unklareZahlungen.length} unklare Zahlung(en)
              </h3>
              <div className="mt-1 text-sm text-orange-700">
                Bitte ordnen Sie die Zahlungen manuell zu oder verwenden Sie
                Auto-Match.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter("UNKLAR")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "UNKLAR"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Unklar ({zahlungen?.filter((z: { status: string }) => z.status === "UNKLAR").length || 0})
        </button>
        <button
          onClick={() => setStatusFilter("ZUGEORDNET")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "ZUGEORDNET"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Zugeordnet
        </button>
        <button
          onClick={() => setStatusFilter("TEILWEISE_ZUGEORDNET")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "TEILWEISE_ZUGEORDNET"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Teilweise
        </button>
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded px-3 py-1 text-sm ${
            !statusFilter
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Alle
        </button>
      </div>

      {/* Tabelle */}
      {zahlungen && zahlungen.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Zahlungen vorhanden
          </h3>
          <p className="mt-2 text-gray-600">
            Importieren Sie Ihre erste CSV-Datei.
          </p>
          <Link
            href="/bank/import"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            CSV importieren
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Verwendungszweck
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Betrag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {zahlungen?.map((zahlung: any) => (
                <tr key={zahlung.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(zahlung.datum).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md truncate">
                      {zahlung.verwendungszweck}
                    </div>
                    {zahlung.iban && (
                      <div className="text-xs text-gray-500">{zahlung.iban}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {zahlung.betrag} €
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        zahlung.status === "UNKLAR"
                          ? "bg-orange-100 text-orange-800"
                          : zahlung.status === "ZUGEORDNET"
                            ? "bg-green-100 text-green-800"
                            : zahlung.status === "TEILWEISE_ZUGEORDNET"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {zahlung.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    {zahlung.status === "UNKLAR" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            ignorierenMutation.mutate({ zahlungId: zahlung.id })
                          }
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Ignorieren
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Zuordnen
                        </button>
                      </div>
                    )}
                    {zahlung.zuordnungen.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {zahlung.zuordnungen.length} Zuordnung(en)
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
