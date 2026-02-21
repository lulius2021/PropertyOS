"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle account lockout error
        if (result.error.includes("ACCOUNT_LOCKED")) {
          const minutes = result.error.split(":")[1] || "15";
          setError(
            `Ihr Account wurde gesperrt. Bitte versuchen Sie es in ${minutes} Minuten erneut.`
          );
        } else {
          setError("Ungültige E-Mail oder Passwort");
        }
      } else if (result?.ok) {
        // Check if 2FA is needed - fetch session to check
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (
          session?.user?.needsTwoFactor &&
          !session?.user?.twoFactorVerified
        ) {
          router.push("/verify-2fa");
        } else {
          const callbackUrl =
            searchParams.get("callbackUrl") || "/dashboard";
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch (err: any) {
      if (err?.message?.includes("429") || err?.status === 429) {
        setError(
          "Zu viele Anmeldeversuche. Bitte warten Sie einen Moment."
        );
      } else {
        setError(
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src="/logos/logo.png"
              alt="PropGate"
              className="h-16 w-16 rounded-xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PropGate</h1>
          <p className="mt-2 text-gray-600">Anmelden am Dashboard</p>
        </div>

        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            {searchParams.get("reset") === "success" && (
              <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
                Passwort wurde erfolgreich zurückgesetzt. Bitte melden Sie
                sich an.
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Passwort
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </form>

          {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true" && (
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Demo-Zugang für Entwicklung:</p>
              <p className="mt-1 font-mono text-xs">
                admin@demo.de / demo1234
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          <a
            href={process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://propgate-marketing.vercel.app"}
            className="text-blue-600 hover:text-blue-700"
          >
            &larr; Zurück zur Website
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-gray-500">Laden...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
