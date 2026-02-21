"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { validatePassword } from "@/lib/password-policy";
import {
  AuthCard, AuthInput, AuthButton, AuthError,
  MailIcon, LockIcon, EyeIcon, UserIcon,
} from "@/components/auth/AuthCard";

const PLANS = {
  starter:      { label: "Starter",      price: "9,99 €/Monat" },
  plus:         { label: "Plus",         price: "29,99 €/Monat" },
  pro:          { label: "Pro",          price: "79,99 €/Monat" },
  unlimited:    { label: "Unlimited",    price: "149,00 €/Monat" },
  professional: { label: "Professional", price: "29 €/Monat" },
  enterprise:   { label: "Enterprise",   price: "99 €/Monat" },
} as const;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") ?? "starter") as keyof typeof PLANS;

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validation = validatePassword(form.password);
    if (!validation.valid) { setError(validation.errors[0]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registrierung fehlgeschlagen"); return; }
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.ok) { router.push("/dashboard"); router.refresh(); }
      else { router.push("/login?registered=true"); }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const planInfo = PLANS[plan] ?? PLANS.starter;

  return (
    <AuthCard>
      <div className="mb-8 text-center">
        <h1 className="text-[2.25rem] font-bold tracking-tight text-white">Account erstellen</h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#6b7a99]">
          Starten Sie jetzt und verwalten Sie Ihr Portfolio professionell.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#0066ff]/25 bg-[#0066ff]/10 px-3 py-1">
          <span className="text-xs font-medium text-[#4da6ff]">{planInfo.label}</span>
          <span className="text-xs text-[#3d4d66]">·</span>
          <span className="text-xs text-[#4da6ff]">{planInfo.price}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthError message={error} />

        <AuthInput
          icon={<UserIcon />}
          type="text"
          required
          value={form.name}
          onChange={set("name")}
          placeholder="Vollständiger Name"
          autoComplete="name"
        />

        <AuthInput
          icon={<MailIcon />}
          type="email"
          required
          value={form.email}
          onChange={set("email")}
          placeholder="E-Mail-Adresse"
          autoComplete="email"
        />

        <div className="space-y-1">
          <AuthInput
            icon={<LockIcon />}
            type={showPw ? "text" : "password"}
            required
            value={form.password}
            onChange={set("password")}
            placeholder="Passwort (mind. 10 Zeichen)"
            autoComplete="new-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="text-[#0066ff] transition hover:text-[#4da6ff]"
                tabIndex={-1}
              >
                <EyeIcon off={!showPw} />
              </button>
            }
          />
          <PasswordStrengthMeter password={form.password} />
        </div>

        <div className="pt-1">
          <AuthButton loading={loading}>
            {loading ? "Account wird erstellt…" : "Kostenlos starten"}
          </AuthButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-[#4a5568]">
        Bereits einen Account?{" "}
        <Link href="/login" className="font-semibold text-[#0066ff] hover:text-[#4da6ff] transition">
          Anmelden
        </Link>
      </p>

      <p className="mt-4 text-center">
        <a
          href={process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://propgate-marketing.vercel.app"}
          className="text-xs text-[#3d4d66] hover:text-[#6b7a99] transition"
        >
          ← Zurück zur Website
        </a>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#07080f]"><div className="text-[#4a5568]">Laden…</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
