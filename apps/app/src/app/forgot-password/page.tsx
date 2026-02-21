"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AuthCard, AuthInput, AuthButton, AuthError, MailIcon,
} from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) { setError("Zu viele Anfragen. Bitte versuchen Sie es später erneut."); return; }
      setSent(true);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      {sent ? (
        <div className="py-4 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
            <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">E-Mail gesendet</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7a99]">
            Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link versendet. Bitte prüfen Sie Ihr Postfach.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-[#0066ff] hover:text-[#4da6ff] transition"
          >
            Zurück zum Login →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 text-center">
            <h1 className="text-[2.25rem] font-bold tracking-tight text-white">Passwort vergessen</h1>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#6b7a99]">
              Geben Sie Ihre E-Mail-Adresse ein — wir senden Ihnen einen Reset-Link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AuthError message={error} />

            <AuthInput
              icon={<MailIcon />}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-Mail-Adresse"
              autoComplete="email"
            />

            <div className="pt-1">
              <AuthButton loading={loading}>
                {loading ? "Wird gesendet…" : "Reset-Link senden"}
              </AuthButton>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#4a5568]">
            <Link href="/login" className="font-semibold text-[#0066ff] hover:text-[#4da6ff] transition">
              ← Zurück zum Login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
