import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--text-primary)]">404</h1>
        <p className="mt-4 text-xl text-[var(--text-secondary)]">Seite nicht gefunden</p>
        <p className="mt-2 text-[var(--text-muted)]">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
