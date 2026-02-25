import { Resend } from "resend";

// Lazy singleton — nur initialisieren wenn API Key vorhanden
let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Backwards-compatible export für bestehenden Code
export const resend = {
  emails: {
    send: async (...args: Parameters<Resend["emails"]["send"]>) => {
      const client = getResend();
      if (!client) return { data: null, error: new Error("Resend not configured") };
      return client.emails.send(...args);
    },
  },
};
