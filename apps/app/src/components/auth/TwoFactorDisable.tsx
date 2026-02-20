"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function TwoFactorDisable({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const disableTOTP = trpc.authSecurity.disableTOTP.useMutation({
    onSuccess: () => {
      onComplete();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        2FA deaktivieren
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-red-800">
          2FA deaktivieren
        </h3>
        <p className="mt-1 text-xs text-red-700">
          Ihr Account wird nach dem Deaktivieren weniger geschützt sein.
          Bestätigen Sie mit Ihrem Passwort.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-white border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ihr aktuelles Passwort"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowConfirm(false);
            setPassword("");
            setError(null);
          }}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
        >
          Abbrechen
        </button>
        <button
          onClick={() => {
            setError(null);
            disableTOTP.mutate({ password });
          }}
          disabled={!password || disableTOTP.isPending}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {disableTOTP.isPending ? "Wird deaktiviert…" : "Deaktivieren"}
        </button>
      </div>
    </div>
  );
}
