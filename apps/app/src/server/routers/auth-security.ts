import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcryptjs";
import * as QRCode from "qrcode";
import { router, protectedProcedure } from "../trpc";
import { passwordSchema } from "@/lib/password-policy";
import {
  generateTOTPSecret,
  verifyTOTP,
  generateRecoveryCodes,
  encryptSecret,
  decryptSecret,
  hashRecoveryCodes,
} from "@/lib/totp";

export const authSecurityRouter = router({
  getSecurityStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { totpEnabled: true },
    });

    return {
      twoFactorEnabled: user?.totpEnabled ?? false,
    };
  }),

  generateTOTPSetup: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { email: true, totpEnabled: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Benutzer nicht gefunden" });
    }

    if (user.totpEnabled) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "2FA ist bereits aktiviert",
      });
    }

    const { secret, uri } = generateTOTPSecret(user.email);
    const qrCodeDataUrl = await QRCode.toDataURL(uri);
    const recoveryCodes = generateRecoveryCodes();

    // Store encrypted secret temporarily (not yet enabled)
    const encryptedSecret = encryptSecret(secret);
    await ctx.db.user.update({
      where: { id: ctx.userId },
      data: { totpSecret: encryptedSecret },
    });

    return {
      qrCode: qrCodeDataUrl,
      secret, // Show to user for manual entry
      recoveryCodes,
    };
  }),

  enableTOTP: protectedProcedure
    .input(
      z.object({
        code: z.string().length(6, "Code muss 6 Ziffern haben"),
        recoveryCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { totpSecret: true, totpEnabled: true },
      });

      if (!user?.totpSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bitte zuerst TOTP-Setup starten",
        });
      }

      if (user.totpEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA ist bereits aktiviert",
        });
      }

      const decryptedSecret = decryptSecret(user.totpSecret);
      const isValid = verifyTOTP(decryptedSecret, input.code);

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ungültiger Code. Bitte versuchen Sie es erneut.",
        });
      }

      // Hash recovery codes and enable 2FA
      const hashedCodes = await hashRecoveryCodes(input.recoveryCodes);
      await ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          totpEnabled: true,
          recoveryCodes: hashedCodes,
        },
      });

      return { success: true };
    }),

  disableTOTP: protectedProcedure
    .input(
      z.object({
        password: z.string().min(1, "Passwort ist erforderlich"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { passwordHash: true, totpEnabled: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!user.totpEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA ist nicht aktiviert",
        });
      }

      const isPasswordValid = await compare(input.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Ungültiges Passwort",
        });
      }

      await ctx.db.user.update({
        where: { id: ctx.userId },
        data: {
          totpEnabled: false,
          totpSecret: null,
          recoveryCodes: null,
        },
      });

      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
        newPassword: passwordSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
        select: { passwordHash: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const isCurrentValid = await compare(
        input.currentPassword,
        user.passwordHash
      );
      if (!isCurrentValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Aktuelles Passwort ist falsch",
        });
      }

      const newHash = await hash(input.newPassword, 12);
      await ctx.db.user.update({
        where: { id: ctx.userId },
        data: { passwordHash: newHash },
      });

      return { success: true };
    }),
});
