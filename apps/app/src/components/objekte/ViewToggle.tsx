"use client";

interface ViewToggleProps {
  view: "table" | "grid";
  onViewChange: (view: "table" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
      <button
        onClick={() => onViewChange("table")}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "table"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Tabelle
      </button>
      <button
        onClick={() => onViewChange("grid")}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          view === "grid"
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        Kacheln
      </button>
    </div>
  );
}
