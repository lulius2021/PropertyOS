import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-base">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PropertyOS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Kostenlos starten
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Immobilienverwaltung
          <br />
          <span className="text-blue-600">einfach gemacht</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          PropertyOS ist Ihre All-in-One-Lösung für professionelle
          Hausverwaltung. Objekte, Mieter, Verträge und Finanzen — alles an
          einem Ort.
        </p>
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Jetzt kostenlos starten →
          </Link>
          <Link
            href="/login"
            className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Bereits angemeldet?
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            {
              title: "Objektverwaltung",
              desc: "Verwalten Sie alle Immobilien zentral an einem Ort.",
              bg: "bg-blue-50",
              icon: "🏢",
            },
            {
              title: "Mieterverwaltung",
              desc: "Vollständige Mieterakte mit Dokumenten und Verlauf.",
              bg: "bg-green-50",
              icon: "👥",
            },
            {
              title: "Finanzen & Bank",
              desc: "CSV-Import, automatisches Matching und Mahnwesen.",
              bg: "bg-purple-50",
              icon: "💰",
            },
            {
              title: "Tickets & Kosten",
              desc: "Schadenserfassung, Handwerker-Tickets und Kostenverfolgung.",
              bg: "bg-orange-50",
              icon: "📋",
            },
            {
              title: "Zählerverwaltung",
              desc: "Strom, Gas, Wasser — Ablesungen digital erfassen.",
              bg: "bg-teal-50",
              icon: "📊",
            },
            {
              title: "DSGVO-konform",
              desc: "EU-Rechenzentren, verschlüsselte Übertragung, automatische Backups.",
              bg: "bg-gray-50",
              icon: "🔒",
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`rounded-xl border border-gray-200 ${f.bg} p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Wählen Sie Ihren Plan
          </h2>
          <p className="text-gray-600 mb-12">Jetzt starten, jederzeit upgraden</p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-left hover:border-blue-300 transition-colors">
              <h3 className="text-xl font-bold text-gray-900">Starter</h3>
              <p className="mt-1 text-sm text-gray-500">Für Einsteiger</p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">0 €</span>
                <span className="text-gray-500 text-sm ml-1">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {["Bis zu 5 Objekte", "Basis-Mieterverwaltung", "Zahlungs-Tracking"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=starter"
                className="mt-8 block w-full rounded-lg border-2 border-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Starter wählen
              </Link>
            </div>

            {/* Professional */}
            <div className="rounded-xl border-2 border-blue-600 bg-white p-8 text-left shadow-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white whitespace-nowrap">
                Beliebtester Plan
              </div>
              <h3 className="text-xl font-bold text-gray-900">Professional</h3>
              <p className="mt-1 text-sm text-gray-500">Für Profis</p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">29 €</span>
                <span className="text-gray-500 text-sm ml-1">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {[
                  "Unbegrenzt Objekte",
                  "Erweiterte Finanz-Features",
                  "Ticket-System",
                  "Dokument-Management",
                  "CSV-Bankimport",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=professional"
                className="mt-8 block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Professional wählen
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-xl border-2 border-gray-200 bg-white p-8 text-left hover:border-blue-300 transition-colors">
              <h3 className="text-xl font-bold text-gray-900">Enterprise</h3>
              <p className="mt-1 text-sm text-gray-500">Für große Portfolios</p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900">99 €</span>
                <span className="text-gray-500 text-sm ml-1">/Monat</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {[
                  "Alles aus Professional",
                  "Multi-User Support",
                  "API-Zugang",
                  "Priority Support",
                  "SLA-Garantie",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?plan=enterprise"
                className="mt-8 block w-full rounded-lg border-2 border-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Enterprise wählen
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>© 2026 PropertyOS · DSGVO-konform · Hosting in der EU</p>
        </div>
      </footer>
    </div>
  );
}
