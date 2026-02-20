"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          isRecoveryCode: isRecovery,
        }),
      });

      if (res.status === 429) {
        setError(
          "Zu viele Versuche. Bitte warten Sie einen Moment."
        );
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ungültiger Code");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zwei-Faktor-Authentifizierung
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isRecovery
              ? "Geben Sie einen Wiederherstellungscode ein."
              : "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein."}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRecovery ? "Wiederherstellungscode" : "Authentifizierungscode"}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isRecovery ? "8-stelliger Code" : "000000"}
                maxLength={isRecovery ? 8 : 6}
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-lg font-mono tracking-widest text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Wird überprüft…" : "Verifizieren"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsRecovery(!isRecovery);
                setCode("");
                setError(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isRecovery
                ? "Authenticator-Code verwenden"
                : "Wiederherstellungscode verwenden"}
            </button>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4 text-center">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
