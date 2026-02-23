/**
 * Dienstleister tRPC Router
 * CRUD operations for service providers
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";

export const dienstleisterRouter = router({
  list: protectedProcedure
    .input(z.object({ kategorie: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.dienstleister.findMany({
        where: { tenantId: ctx.tenantId, kategorie: input?.kategorie },
        include: { _count: { select: { tickets: true } } },
        orderBy: { name: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        telefon: z.string().optional(),
        email: z.string().email().optional(),
        kategorie: z.string().optional(),
        notiz: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const d = await ctx.db.dienstleister.create({
        data: { tenantId: ctx.tenantId, ...input },
      });
      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "DIENSTLEISTER_ERSTELLT",
        entitaet: "Dienstleister",
        entitaetId: d.id,
        neuWert: d,
      });
      return d;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        telefon: z.string().optional(),
        email: z.string().email().optional(),
        kategorie: z.string().optional(),
        notiz: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const d = await ctx.db.dienstleister.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "DIENSTLEISTER_GEAENDERT",
        entitaet: "Dienstleister",
        entitaetId: id,
        neuWert: d,
      });
      return d;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.dienstleister.delete({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "DIENSTLEISTER_GELOESCHT",
        entitaet: "Dienstleister",
        entitaetId: input.id,
      });
      return true;
    }),
});
