import { TOTP, Secret } from "otpauth";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { hash, compare } from "bcryptjs";

const ISSUER = "PropGate";

function getEncryptionKey(): Buffer {
  const key = process.env.TOTP_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("TOTP_ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "hex");
}

export function generateTOTPSecret(email: string): {
  secret: string;
  uri: string;
} {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTOTP(secret: string, code: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });

  // window=1 allows 1 step drift in each direction (±30s)
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

export function generateRecoveryCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = randomBytes(4).toString("hex"); // 8 hex chars
    codes.push(code);
  }
  return codes;
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:encrypted (all hex)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

export async function hashRecoveryCodes(
  codes: string[]
): Promise<string> {
  const hashed = await Promise.all(codes.map((code) => hash(code, 10)));
  return JSON.stringify(hashed);
}

export async function verifyRecoveryCode(
  code: string,
  hashedCodesJson: string
): Promise<{ valid: boolean; remainingCodes: string }> {
  const hashedCodes: string[] = JSON.parse(hashedCodesJson);

  for (let i = 0; i < hashedCodes.length; i++) {
    const isMatch = await compare(code, hashedCodes[i]);
    if (isMatch) {
      // Remove used code
      const remaining = [...hashedCodes];
      remaining.splice(i, 1);
      return { valid: true, remainingCodes: JSON.stringify(remaining) };
    }
  }

  return { valid: false, remainingCodes: hashedCodesJson };
}
