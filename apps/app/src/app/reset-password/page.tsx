"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { validatePassword } from "@/lib/password-policy";
import {
  AuthCard, AuthInput, AuthButton, AuthError, LockIcon, EyeIcon,
} from "@/components/auth/AuthCard";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthCard>
        <div className="py-4 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Ungültiger Link</h1>
          <p className="mt-2 text-sm text-[#6b7a99]">Dieser Reset-Link ist ungültig oder abgelaufen.</p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block text-sm font-semibold text-[#0066ff] hover:text-[#4da6ff] transition"
          >
            Neuen Link anfordern →
          </Link>
        </div>
      </AuthCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwörter stimmen nicht überein"); return; }
    const validation = validatePassword(password);
    if (!validation.valid) { setError(validation.errors[0]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Ein Fehler ist aufgetreten"); return; }
      router.push("/login?reset=success");
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <h1 className="text-[2.25rem] font-bold tracking-tight text-white">Neues Passwort</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#6b7a99]">
          Wählen Sie ein starkes Passwort für Ihren Account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthError message={error} />

        <div className="space-y-1">
          <AuthInput
            icon={<LockIcon />}
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Neues Passwort"
            autoComplete="new-password"
            trailing={
              <button type="button" onClick={() => setShowPw(!showPw)} className="text-[#0066ff] hover:text-[#4da6ff] transition" tabIndex={-1}>
                <EyeIcon off={!showPw} />
              </button>
            }
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <AuthInput
          icon={<LockIcon />}
          type={showConfirm ? "text" : "password"}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Passwort bestätigen"
          autoComplete="new-password"
          trailing={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-[#0066ff] hover:text-[#4da6ff] transition" tabIndex={-1}>
              <EyeIcon off={!showConfirm} />
            </button>
          }
        />

        <div className="pt-1">
          <AuthButton loading={loading}>
            {loading ? "Wird gespeichert…" : "Passwort zurücksetzen"}
          </AuthButton>
        </div>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#07080f]"><div className="text-[#4a5568]">Laden…</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
