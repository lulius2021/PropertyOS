"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Star, X } from "lucide-react";

type Kategorie = "ALLGEMEIN" | "FEATURE" | "BUG" | "LOB";

const KATEGORIEN: { value: Kategorie; label: string }[] = [
  { value: "ALLGEMEIN", label: "Allgemein" },
  { value: "FEATURE", label: "Feature-Wunsch" },
  { value: "BUG", label: "Fehler melden" },
  { value: "LOB", label: "Lob" },
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const [bewertung, setBewertung] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [kategorie, setKategorie] = useState<Kategorie>("ALLGEMEIN");
  const [nachricht, setNachricht] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSubmitted(false);
        setBewertung(null);
        setKategorie("ALLGEMEIN");
        setNachricht("");
      }, 1500);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (nachricht.length < 10) return;
    submitMutation.mutate({
      nachricht,
      bewertung: bewertung ?? undefined,
      kategorie,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mb-3 text-4xl">🎉</div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">Vielen Dank!</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Ihr Feedback hilft uns, PropGate zu verbessern.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
              Feedback senden
            </h2>
            <p className="mb-5 text-sm text-[var(--text-secondary)]">
              Teilen Sie uns Ihre Erfahrungen mit — wir lesen jedes Feedback.
            </p>

            {/* Sterne-Rating */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
                Bewertung (optional)
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setBewertung(bewertung === star ? null : star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= (hoveredStar ?? bewertung ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-[var(--border)]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Kategorie */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Kategorie</p>
              <div className="flex flex-wrap gap-2">
                {KATEGORIEN.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => setKategorie(k.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      kategorie === k.value
                        ? "bg-blue-600 text-white"
                        : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-400 hover:text-blue-400"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nachricht */}
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
                Nachricht <span className="text-red-400">*</span>
              </p>
              <textarea
                value={nachricht}
                onChange={(e) => setNachricht(e.target.value)}
                placeholder="Was möchten Sie uns mitteilen? (mind. 10 Zeichen)"
                rows={4}
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-page)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                {nachricht.length}/2000
              </p>
            </div>

            {submitMutation.error && (
              <p className="mb-3 text-sm text-red-500">{submitMutation.error.message}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSubmit}
                disabled={nachricht.length < 10 || submitMutation.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitMutation.isPending ? "Sende…" : "Feedback senden"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
