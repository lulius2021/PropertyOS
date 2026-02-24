"use client";

import { trpc } from "@/lib/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const statusOptions = [
  "ERFASST",
  "IN_BEARBEITUNG",
  "ZUR_PRUEFUNG",
  "ABGESCHLOSSEN",
  "BEAUFTRAGT",
  "TERMIN_VEREINBART",
  "IN_ARBEIT",
  "RUECKFRAGE",
  "ABGERECHNET",
] as const;

const STATUS_LABELS: Record<string, string> = {
  ERFASST: "Erfasst",
  IN_BEARBEITUNG: "In Bearbeitung",
  ZUR_PRUEFUNG: "Zur Prüfung",
  ABGESCHLOSSEN: "Abgeschlossen",
  BEAUFTRAGT: "Beauftragt",
  TERMIN_VEREINBART: "Termin vereinbart",
  IN_ARBEIT: "In Arbeit",
  RUECKFRAGE: "Rückfrage",
  ABGERECHNET: "Abgerechnet",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ERFASST":
      return "bg-gray-500/15 text-gray-400";
    case "IN_BEARBEITUNG":
      return "bg-blue-500/15 text-blue-400";
    case "ZUR_PRUEFUNG":
      return "bg-yellow-500/15 text-yellow-400";
    case "ABGESCHLOSSEN":
      return "bg-green-500/15 text-green-400";
    default:
      return "bg-gray-500/15 text-gray-400";
  }
};

const getPrioColor = (prio: string) => {
  switch (prio) {
    case "NIEDRIG":
      return "bg-gray-500/15 text-gray-400";
    case "MITTEL":
      return "bg-yellow-500/15 text-yellow-400";
    case "HOCH":
      return "bg-orange-500/15 text-orange-400";
    case "KRITISCH":
      return "bg-red-500/15 text-red-400";
    default:
      return "bg-gray-500/15 text-gray-400";
  }
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [kommentarText, setKommentarText] = useState("");
  const [ereigniszeit, setEreigniszeit] = useState("");
  const [dienstleisterId, setDienstleisterId] = useState("");

  const utils = trpc.useUtils();
  const { data: dienstleister } = trpc.dienstleister.list.useQuery();

  const { data: ticket, isLoading, error } = trpc.tickets.getById.useQuery({ id });

  const changeStatusMutation = trpc.tickets.changeStatus.useMutation({
    onSuccess: () => {
      utils.tickets.getById.invalidate({ id });
    },
    onError: (err) => {
      toast.error("Fehler: " + err.message);
    },
  });

  const addCommentMutation = trpc.tickets.addComment.useMutation({
    onSuccess: () => {
      utils.tickets.getById.invalidate({ id });
      setKommentarText("");
      setEreigniszeit("");
      setDienstleisterId("");
    },
    onError: (err) => {
      toast.error("Fehler: " + err.message);
    },
  });

  if (isLoading) {
    return <div className="p-4">Laden...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Fehler: {error.message}</div>;
  }

  if (!ticket) {
    return <div className="p-4 text-[var(--text-secondary)]">Ticket nicht gefunden.</div>;
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === ticket.status) return;
    changeStatusMutation.mutate({
      ticketId: ticket.id,
      status: newStatus as (typeof statusOptions)[number],
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kommentarText.trim()) return;
    addCommentMutation.mutate({
      ticketId: ticket.id,
      text: kommentarText.trim(),
      ereigniszeit: ereigniszeit ? new Date(ereigniszeit) : undefined,
      dienstleisterId: dienstleisterId || undefined,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/tickets")}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Zurück zu Tickets
        </button>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getStatusColor(ticket.status)}`}
        >
          {ticket.status}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getPrioColor(ticket.prioritaet)}`}
        >
          {ticket.prioritaet}
        </span>
      </div>

      {/* Title & Description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{ticket.titel}</h1>
        {ticket.beschreibung && (
          <p className="mt-2 text-[var(--text-secondary)]">{ticket.beschreibung}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm md:grid-cols-4">
        <div>
          <div className="text-xs font-medium uppercase text-[var(--text-secondary)]">Kategorie</div>
          <div className="mt-1 text-sm text-[var(--text-primary)]">{ticket.kategorie}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-[var(--text-secondary)]">Frist</div>
          <div className="mt-1 text-sm text-[var(--text-primary)]">
            {ticket.frist
              ? new Date(ticket.frist).toLocaleDateString("de-DE")
              : "-"}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-[var(--text-secondary)]">Ersteller</div>
          <div className="mt-1 text-sm text-[var(--text-primary)]">{ticket.ersteller || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase text-[var(--text-secondary)]">
            Verantwortlicher
          </div>
          <div className="mt-1 text-sm text-[var(--text-primary)]">
            {ticket.verantwortlicher || "-"}
          </div>
        </div>
      </div>

      {/* Zugeordnetes Objekt / Einheit */}
      {(ticket.objektId || ticket.einheitId) && (
        <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
          <div className="text-xs font-medium uppercase text-[var(--text-secondary)] mb-2">
            Zuordnung
          </div>
          <div className="flex gap-4">
            {ticket.objektId && (
              <button
                onClick={() => router.push(`/objekte/${ticket.objektId}`)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Objekt anzeigen &rarr;
              </button>
            )}
            {ticket.einheitId && (
              <button
                onClick={() => router.push(`/einheiten/${ticket.einheitId}`)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Einheit anzeigen &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status aendern */}
      <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
        <div className="text-xs font-medium uppercase text-[var(--text-secondary)] mb-2">
          Status ändern
        </div>
        <select
          value={ticket.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={changeStatusMutation.isPending}
          className="rounded border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        {changeStatusMutation.isPending && (
          <span className="ml-2 text-sm text-[var(--text-secondary)]">Speichern...</span>
        )}
      </div>

      {/* Kommentare */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Kommentare</h2>

        {ticket.kommentare && ticket.kommentare.length > 0 ? (
          <div className="space-y-3 mb-4">
            {ticket.kommentare.map((k: any) => (
              <div
                key={k.id}
                className="rounded border border-[var(--border)] bg-[var(--bg-page)] p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                      {k.verfasser || "Unbekannt"}
                    </span>
                    {k.dienstleister && (
                      <span className="inline-flex rounded-full bg-blue-500/15 px-2 py-0.5 text-xs text-blue-400">
                        {k.dienstleister.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {k.ereigniszeit && (
                      <div className="text-xs text-[var(--text-secondary)]">
                        Ereignis: {new Date(k.ereigniszeit).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      Erfasst: {new Date(k.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-primary)]">{k.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] mb-4">Noch keine Kommentare.</p>
        )}

        {/* Kommentar hinzufuegen */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Ereigniszeitpunkt (optional)
              </label>
              <input
                type="datetime-local"
                value={ereigniszeit}
                onChange={(e) => setEreigniszeit(e.target.value)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Dienstleister (optional)
              </label>
              <select
                value={dienstleisterId}
                onChange={(e) => setDienstleisterId(e.target.value)}
                className="w-full rounded border border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-primary)] px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Kein Dienstleister</option>
                {dienstleister?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <textarea
              value={kommentarText}
              onChange={(e) => setKommentarText(e.target.value)}
              placeholder="Kommentar schreiben..."
              rows={2}
              className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={addCommentMutation.isPending || !kommentarText.trim()}
              className="self-end rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {addCommentMutation.isPending ? "..." : "Senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
