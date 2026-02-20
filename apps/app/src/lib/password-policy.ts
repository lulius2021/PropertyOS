import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Passwort muss mindestens 10 Zeichen lang sein")
  .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
  .regex(/[a-z]/, "Passwort muss mindestens einen Kleinbuchstaben enthalten")
  .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten")
  .regex(
    /[^A-Za-z0-9]/,
    "Passwort muss mindestens ein Sonderzeichen enthalten"
  );

const STRENGTH_LABELS = [
  "Sehr schwach",
  "Schwach",
  "Mittel",
  "Stark",
  "Sehr stark",
] as const;

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
] as const;

export type PasswordStrength = {
  score: number; // 0-4
  label: (typeof STRENGTH_LABELS)[number];
  color: (typeof STRENGTH_COLORS)[number];
};

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Map 0-5 checks to 0-4 score
  const normalizedScore = Math.min(Math.max(score - 1, 0), 4);

  return {
    score: normalizedScore,
    label: STRENGTH_LABELS[normalizedScore],
    color: STRENGTH_COLORS[normalizedScore],
  };
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const result = passwordSchema.safeParse(password);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((e) => e.message),
  };
}
