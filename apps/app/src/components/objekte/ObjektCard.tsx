"use client";

import { ObjektImage } from "./ObjektImage";

interface ObjektCardProps {
  objekt: {
    id: string;
    bezeichnung: string;
    strasse: string;
    plz: string;
    ort: string;
    objektart: string;
    bildUrl?: string | null;
    _count: {
      einheiten: number;
    };
  };
  onClick: () => void;
}

export function ObjektCard({ objekt, onClick }: ObjektCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md active:scale-95"
    >
      {/* Objekt-Bild */}
      <div className="mb-4 transition-transform group-hover:scale-105">
        <ObjektImage
          bildUrl={objekt.bildUrl}
          alt={objekt.bezeichnung}
          size="medium"
        />
      </div>

      {/* Bezeichnung */}
      <h3 className="mb-1 text-center text-base font-semibold text-[var(--text-primary)]">
        {objekt.bezeichnung}
      </h3>

      {/* Adresse */}
      <p className="mb-2 text-center text-xs text-[var(--text-secondary)]">
        {objekt.strasse}
      </p>
      <p className="mb-3 text-center text-xs text-[var(--text-secondary)]">
        {objekt.plz} {objekt.ort}
      </p>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1">
          <span className="font-medium">{objekt._count.einheiten}</span>
          <span>Einheiten</span>
        </div>
        <div className="h-4 w-px bg-[var(--border)]" />
        <div className="rounded bg-[var(--bg-card-hover)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]">
          {objekt.objektart}
        </div>
      </div>
    </button>
  );
}
