"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlanLimitReached } from "@/components/ui/PlanLimitReached";

// Form Schema
const createTicketSchema = z.object({
  titel: z.string().min(1, "Titel erforderlich"),
  beschreibung: z.string().optional(),
  kategorie: z.enum(["SCHADENSMELDUNG", "WARTUNG", "ANFRAGE", "BESCHWERDE", "SANIERUNG"]),
  prioritaet: z.enum(["NIEDRIG", "MITTEL", "HOCH", "KRITISCH"]),
  frist: z.string().optional(),
});

type CreateTicketInput = z.infer<typeof createTicketSchema>;

export default function TicketsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    "ERFASST" | "IN_BEARBEITUNG" | "ZUR_PRUEFUNG" | "ABGESCHLOSSEN" | undefined
  >();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: tickets, isLoading, error } = trpc.tickets.list.useQuery({
    status: statusFilter,
  });
  const { data: stats } = trpc.tickets.stats.useQuery();

  // Form Hook
  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      titel: "",
      beschreibung: "",
      kategorie: "ANFRAGE",
      prioritaet: "MITTEL",
    },
  });

  // Create Mutation
  const createMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      utils.tickets.list.invalidate();
      utils.tickets.stats.invalidate();
      setCreateDialogOpen(false);
      form.reset();
      alert("Ticket erfolgreich erstellt!");
    },
    onError: (error) => {
      alert("Fehler: " + error.message);
    },
  });

  // Submit Handler
  const onSubmit = (data: CreateTicketInput) => {
    createMutation.mutate({
      ...data,
      beschreibung: data.beschreibung || "",
      frist: data.frist ? new Date(data.frist) : undefined,
    });
  };

  // Plan-Gate: Feature nicht verfügbar
  if (error?.data?.code === "FORBIDDEN") {
    return (
      <div className="mx-auto max-w-lg mt-12">
        <PlanLimitReached
          feature="tickets"
          message={error.message}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div>Laden...</div>;
  }

  const getPrioColor = (prio: string) => {
    switch (prio) {
      case "KRITISCH":
        return "bg-red-100 text-red-800";
      case "HOCH":
        return "bg-orange-100 text-orange-800";
      case "MITTEL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ERFASST":
        return "bg-blue-100 text-blue-800";
      case "IN_BEARBEITUNG":
        return "bg-purple-100 text-purple-800";
      case "ZUR_PRUEFUNG":
        return "bg-orange-100 text-orange-800";
      case "ABGESCHLOSSEN":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-2 text-gray-600">
            Schadensmeldungen, Wartung und Anfragen
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Neues Ticket
        </Button>
      </div>

      {/* Statistiken */}
      {stats && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Erfasst</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {stats.erfasst}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">In Bearbeitung</div>
            <div className="mt-1 text-2xl font-bold text-purple-600">
              {stats.inBearbeitung}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Kritisch (offen)</div>
            <div className="mt-1 text-2xl font-bold text-red-600">
              {stats.kritisch}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2">
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
        <button
          onClick={() => setStatusFilter("ERFASST")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "ERFASST"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Erfasst
        </button>
        <button
          onClick={() => setStatusFilter("IN_BEARBEITUNG")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "IN_BEARBEITUNG"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          In Bearbeitung
        </button>
        <button
          onClick={() => setStatusFilter("ABGESCHLOSSEN")}
          className={`rounded px-3 py-1 text-sm ${
            statusFilter === "ABGESCHLOSSEN"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Abgeschlossen
        </button>
      </div>

      {/* Tabelle */}
      {tickets && tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Keine Tickets vorhanden
          </h3>
          <p className="mt-2 text-gray-600">Erstellen Sie Ihr erstes Ticket.</p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ticket erstellen
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Titel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Priorität
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tickets?.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/tickets/${ticket.id}`)}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.titel}</div>
                    {ticket._count.kommentare > 0 && (
                      <div className="text-xs text-gray-500">
                        {ticket._count.kommentare} Kommentar(e)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {ticket.kategorie}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getPrioColor(ticket.prioritaet)}`}
                    >
                      {ticket.prioritaet}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Neues Ticket erstellen
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <Input
                {...form.register("titel")}
                placeholder="z.B. Wasserhahn tropft"
                className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
              />
              {form.formState.errors.titel && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.titel.message}
                </p>
              )}
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <Textarea
                {...form.register("beschreibung")}
                placeholder="Details zum Problem..."
                rows={4}
                className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none placeholder:text-gray-400"
              />
            </div>

            {/* Kategorie & Priorität nebeneinander */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie *
                </label>
                <Select
                  value={form.watch("kategorie")}
                  onValueChange={(value) =>
                    form.setValue("kategorie", value as any)
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="SCHADENSMELDUNG" className="text-gray-900">
                      Schadensmeldung
                    </SelectItem>
                    <SelectItem value="WARTUNG" className="text-gray-900">
                      Wartung
                    </SelectItem>
                    <SelectItem value="ANFRAGE" className="text-gray-900">
                      Anfrage
                    </SelectItem>
                    <SelectItem value="BESCHWERDE" className="text-gray-900">
                      Beschwerde
                    </SelectItem>
                    <SelectItem value="SANIERUNG" className="text-gray-900">
                      Sanierung
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorität *
                </label>
                <Select
                  value={form.watch("prioritaet")}
                  onValueChange={(value) =>
                    form.setValue("prioritaet", value as any)
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="NIEDRIG" className="text-gray-900">
                      Niedrig
                    </SelectItem>
                    <SelectItem value="MITTEL" className="text-gray-900">
                      Mittel
                    </SelectItem>
                    <SelectItem value="HOCH" className="text-gray-900">
                      Hoch
                    </SelectItem>
                    <SelectItem value="KRITISCH" className="text-gray-900">
                      Kritisch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Frist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frist (Optional)
              </label>
              <Input
                type="date"
                {...form.register("frist")}
                className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createMutation.isPending ? "Erstelle..." : "Ticket erstellen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
