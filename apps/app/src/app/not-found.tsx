import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Seite nicht gefunden</p>
        <p className="mt-2 text-gray-500">
          Die angeforderte Seite konnte nicht gefunden werden.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
