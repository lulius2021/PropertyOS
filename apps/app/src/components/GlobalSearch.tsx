"use client";

import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: results, isLoading } = trpc.suche.global.useQuery(
    { query },
    { enabled: query.length >= 2, staleTime: 5000 }
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); }
    else { setQuery(""); }
  }, [open]);

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Suchen...</span>
        <kbd className="ml-1 rounded border border-gray-300 px-1 py-0.5 text-xs text-gray-400">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setOpen(false)}>
      <div className="flex min-h-screen items-start justify-center pt-16 px-4">
        <div className="relative w-full max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-200"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center border-b border-gray-200 px-4">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen nach Objekt, Mieter, Ticket..."
              className="flex-1 bg-transparent px-3 py-4 text-sm text-gray-900 placeholder-gray-400 outline-none" />
            {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />}
          </div>

          {query.length >= 2 && results && (
            <div className="max-h-96 overflow-y-auto p-2">
              {results.objekte.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Objekte</div>
                  {results.objekte.map((o: any) => (
                    <button key={o.id} onClick={() => navigate(`/objekte/${o.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      <span className="flex-1 font-medium text-gray-900">{o.bezeichnung}</span>
                      <span className="text-gray-400">{o.strasse}, {o.ort}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.mieter.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Mieter</div>
                  {results.mieter.map((m: any) => (
                    <button key={m.id} onClick={() => navigate(`/mieter/${m.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      <span className="flex-1 font-medium text-gray-900">{m.nachname}, {m.vorname}</span>
                      {m.email && <span className="text-gray-400">{m.email}</span>}
                    </button>
                  ))}
                </div>
              )}
              {results.tickets.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Tickets</div>
                  {results.tickets.map((t: any) => (
                    <button key={t.id} onClick={() => navigate(`/tickets/${t.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      <span className="flex-1 font-medium text-gray-900">{t.titel}</span>
                      <span className="text-xs text-gray-400">{t.status}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.einheiten.length > 0 && (
                <div className="mb-2">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Einheiten</div>
                  {results.einheiten.map((e: any) => (
                    <button key={e.id} onClick={() => navigate(`/einheiten/${e.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100">
                      <span className="flex-1 font-medium text-gray-900">Einheit {e.einheitNr}</span>
                      <span className="text-gray-400">{e.objekt?.bezeichnung}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.objekte.length === 0 && results.mieter.length === 0 && results.tickets.length === 0 && results.einheiten.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">Keine Ergebnisse für "{query}"</div>
              )}
            </div>
          )}
          {query.length < 2 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">Mindestens 2 Zeichen eingeben...</div>
          )}
        </div>
      </div>
    </div>
  );
}
