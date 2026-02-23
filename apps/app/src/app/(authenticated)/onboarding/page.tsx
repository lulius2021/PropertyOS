"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

const THEMES = [
  { value: "hell", label: "Hell", description: "Klassisches helles Design" },
  { value: "dunkel", label: "Dunkel", description: "Augenschonendes dunkles Design" },
  { value: "system", label: "System", description: "Folgt Systemeinstellung" },
];

const COLORS = [
  { value: "blau", label: "Blau", class: "bg-blue-500" },
  { value: "gruen", label: "Grün", class: "bg-green-500" },
  { value: "lila", label: "Lila", class: "bg-purple-500" },
];

const VORLAGEN = [
  {
    value: "kompakt",
    label: "Kompakt",
    description: "Nur die wichtigsten KPIs — ideal für schnellen Überblick",
    widgets: ["Objekte", "Einheiten", "Rückstände", "Tickets"],
  },
  {
    value: "vollstaendig",
    label: "Vollständig",
    description: "Alle Widgets — maximale Information auf einen Blick",
    widgets: ["KPIs", "Vermietungsquote", "Handlungsbedarf", "Schnellzugriff", "Cashflow-Charts"],
  },
  {
    value: "vermieter",
    label: "Vermieter-Fokus",
    description: "KPIs, Mahnwesen und Cashflow — ideal für aktive Vermieter",
    widgets: ["KPIs", "Mahnungen", "Cashflow", "Rückstände"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [themeMode, setThemeMode] = useState("hell");
  const [accentColor, setAccentColor] = useState("blau");
  const [dashboardVorlage, setDashboardVorlage] = useState("vollstaendig");
  const [saving, setSaving] = useState(false);

  const completeOnboarding = trpc.userSettings.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const handleFinish = () => {
    setSaving(true);
    completeOnboarding.mutate({ themeMode, accentColor, dashboardVorlage });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-2.5 w-2.5 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"}`} />
            <div className={`h-0.5 flex-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className={`h-2.5 w-2.5 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"}`} />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Design</span>
            <span>Dashboard-Vorlage</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Willkommen bei PropGate!</h1>
              <p className="text-gray-500 mb-8">Richten Sie Ihr Dashboard in wenigen Schritten ein.</p>

              <h2 className="text-base font-semibold text-gray-900 mb-4">Design wählen</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setThemeMode(t.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      themeMode === t.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                  </button>
                ))}
              </div>

              <h2 className="text-base font-semibold text-gray-900 mb-4">Akzentfarbe</h2>
              <div className="flex gap-3 mb-8">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 transition-all ${
                      accentColor === c.value ? "border-gray-900" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${c.class}`} />
                    <span className="text-sm font-medium text-gray-700">{c.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Weiter
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard-Vorlage</h2>
              <p className="text-gray-500 mb-8">Wählen Sie, welche Informationen Ihr Dashboard zeigen soll.</p>

              <div className="space-y-3 mb-8">
                {VORLAGEN.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setDashboardVorlage(v.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      dashboardVorlage === v.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{v.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{v.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {v.widgets.map((w) => (
                        <span key={w} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{w}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Speichere..." : "Speichern & Loslegen"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
