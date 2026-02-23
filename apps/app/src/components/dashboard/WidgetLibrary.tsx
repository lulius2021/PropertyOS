"use client";

import { useState } from "react";
import { WidgetType, WidgetSize } from "./widgets/types";
import { WIDGET_DEFINITIONS } from "./widgets/definitions";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, size: WidgetSize) => void;
  activeWidgets: WidgetType[];
}

export function WidgetLibrary({ isOpen, onClose, onAdd, activeWidgets }: WidgetLibraryProps) {
  const [selectedWidget, setSelectedWidget] = useState<WidgetType | null>(null);
  const [selectedSize, setSelectedSize] = useState<WidgetSize>("medium");

  if (!isOpen) return null;

  const availableWidgets = WIDGET_DEFINITIONS;
  const selected = availableWidgets.find((w) => w.type === selectedWidget);

  const handleAdd = () => {
    if (selectedWidget) {
      onAdd(selectedWidget, selectedSize);
      setSelectedWidget(null);
      setSelectedSize("medium");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[var(--bg-card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Widget-Bibliothek</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Widget auswählen und zum Dashboard hinzufügen</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Widget List */}
          <div className="w-1/3 overflow-y-auto border-r border-[var(--border)] p-4">
            <div className="space-y-2">
              {availableWidgets.map((widget) => {
                const isActive = activeWidgets.includes(widget.type);
                const isSelected = selectedWidget === widget.type;

                return (
                  <button
                    key={widget.type}
                    onClick={() => setSelectedWidget(widget.type)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${widget.bg}`}>
                        <div className={widget.color}>{widget.icon}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{widget.name}</p>
                        <p className="truncate text-xs text-[var(--text-secondary)]">{widget.description}</p>
                      </div>
                      {isActive && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-1 text-xs font-medium text-green-400">
                            Aktiv
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto p-6">
            {selected ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{selected.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{selected.description}</p>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-[var(--text-secondary)]">Größe wählen</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as WidgetSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-lg border p-3 text-center transition-all ${
                          selectedSize === size
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                      >
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {size === "small" ? "Klein" : size === "medium" ? "Mittel" : "Groß"}
                        </div>
                        <div className="mt-1 text-xs text-[var(--text-secondary)]">
                          {selected.sizes[size].w}x{selected.sizes[size].h}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Box */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-[var(--text-secondary)]">Vorschau</label>
                  <div className="rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-page)] p-8">
                    <div
                      className={`mx-auto rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm ${
                        selectedSize === "small"
                          ? "max-w-xs"
                          : selectedSize === "medium"
                            ? "max-w-md"
                            : "max-w-2xl"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-3 ${selected.bg}`}>
                          <div className={selected.color}>{selected.icon}</div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-secondary)]">{selected.name}</p>
                          <p className="text-2xl font-bold text-[var(--text-primary)]">—</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[var(--text-secondary)]">{selected.description}</p>
                    </div>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAdd}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Widget hinzufügen
                </button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-[var(--text-muted)]">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <p className="mt-4 text-sm font-medium">Widget links auswählen</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
