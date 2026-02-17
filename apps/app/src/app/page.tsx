import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // Redirect logged-in users directly to dashboard
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">PropertyOS</h1>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Immobilienverwaltung
          <br />
          <span className="text-blue-600">einfach gemacht</span>
        </h2>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
          PropertyOS ist Ihre All-in-One-Lösung für professionelle
          Hausverwaltung. Objekte, Mieter, Verträge und Finanzen — alles an
          einem Ort.
        </p>
        <div className="mt-10">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Jetzt anmelden
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {[
            {
              title: "Objektverwaltung",
              desc: "Verwalten Sie alle Immobilien zentral an einem Ort.",
            },
            {
              title: "Mieterverwaltung",
              desc: "Vollständige Mieterakte mit Dokumenten und Verlauf.",
            },
            {
              title: "Finanzen & Bank",
              desc: "CSV-Import, automatisches Matching und Mahnwesen.",
            },
            {
              title: "Tickets & Kosten",
              desc: "Schadenserfassung, Handwerker-Tickets und Kostenverfolgung.",
            },
            {
              title: "Zählerverwaltung",
              desc: "Strom, Gas, Wasser — Ablesungen digital erfassen.",
            },
            {
              title: "Reporting",
              desc: "Auswertungen und Exporte für alle Bereiche.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>© 2026 PropertyOS · DSGVO-konform · Hosting in der EU</p>
      </footer>
    </div>
  );
}
