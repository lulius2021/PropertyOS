"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Ein Fehler ist aufgetreten</h1>
        <p className="mt-4 text-gray-600">
          Es tut uns leid, aber etwas ist schief gelaufen.
        </p>
        {error.message && (
          <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        )}
        <div className="mt-8 space-x-4">
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="inline-block rounded-md border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Zurück zum Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
