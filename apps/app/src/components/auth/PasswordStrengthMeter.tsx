"use client";

import { getPasswordStrength } from "@/lib/password-policy";

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-1 text-xs ${
          score <= 1
            ? "text-red-600"
            : score === 2
              ? "text-yellow-600"
              : "text-green-600"
        }`}
      >
        Passwortstärke: {label}
      </p>
    </div>
  );
}
