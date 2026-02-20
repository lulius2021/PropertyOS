import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findFirst({
            where: {
              email: credentials.email as string,
            },
            include: {
              tenant: true,
            },
          });

          if (!user) {
            return null;
          }

          // Check account lockout
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMs =
              user.lockedUntil.getTime() - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            throw new Error(
              `ACCOUNT_LOCKED:${remainingMin}`
            );
          }

          // Verify password
          const isPasswordValid = await compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            // Increment failed attempts
            const newAttempts = user.failedLoginAttempts + 1;
            const updateData: any = {
              failedLoginAttempts: newAttempts,
            };

            // Lock account after MAX_FAILED_ATTEMPTS
            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
              updateData.lockedUntil = new Date(
                Date.now() + LOCKOUT_DURATION_MS
              );
            }

            await db.user.update({
              where: { id: user.id },
              data: updateData,
            });

            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
              throw new Error("ACCOUNT_LOCKED:15");
            }

            return null;
          }

          // Successful login - reset failed attempts
          if (user.failedLoginAttempts > 0 || user.lockedUntil) {
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
              },
            });
          }

          // Return user data with 2FA flag
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId,
            tenantName: user.tenant.name,
            role: user.role,
            needsTwoFactor: user.totpEnabled,
            twoFactorVerified: false,
          };
        } catch (error: any) {
          if (error?.message?.startsWith("ACCOUNT_LOCKED:")) {
            throw error;
          }
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: any; user: any; trigger?: string; session?: any }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
        token.role = user.role;
        token.needsTwoFactor = user.needsTwoFactor ?? false;
        token.twoFactorVerified = user.twoFactorVerified ?? false;
      }
      // Allow updating 2FA verification status via session update
      if (trigger === "update" && session?.twoFactorVerified !== undefined) {
        token.twoFactorVerified = session.twoFactorVerified;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName;
        session.user.role = token.role;
        session.user.needsTwoFactor = token.needsTwoFactor;
        session.user.twoFactorVerified = token.twoFactorVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
