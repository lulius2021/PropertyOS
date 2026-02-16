import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { logAudit } from "../middleware/audit";

export const objekteRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.objekt.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        _count: {
          select: {
            einheiten: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.objekt.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          einheiten: true,
          dokumente: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        bezeichnung: z.string().min(1),
        strasse: z.string().min(1),
        plz: z.string().min(1),
        ort: z.string().min(1),
        objektart: z.enum(["WOHNHAUS", "GEWERBE", "GEMISCHT"]),
        gesamtflaeche: z.number().optional(),
        notizen: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const objekt = await ctx.db.objekt.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "OBJEKT_ERSTELLT",
        entitaet: "Objekt",
        entitaetId: objekt.id,
        neuWert: objekt,
      });

      return objekt;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        bezeichnung: z.string().min(1).optional(),
        strasse: z.string().min(1).optional(),
        plz: z.string().min(1).optional(),
        ort: z.string().min(1).optional(),
        objektart: z.enum(["WOHNHAUS", "GEWERBE", "GEMISCHT"]).optional(),
        gesamtflaeche: z.number().optional(),
        notizen: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const old = await ctx.db.objekt.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });

      const objekt = await ctx.db.objekt.update({
        where: { id },
        data,
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "OBJEKT_GEAENDERT",
        entitaet: "Objekt",
        entitaetId: objekt.id,
        altWert: old,
        neuWert: objekt,
      });

      return objekt;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const objekt = await ctx.db.objekt.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      await ctx.db.objekt.delete({
        where: { id: input.id },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "OBJEKT_GELOESCHT",
        entitaet: "Objekt",
        entitaetId: input.id,
        altWert: objekt,
      });

      return { success: true };
    }),
});
