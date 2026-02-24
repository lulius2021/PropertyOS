import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";

export const wartungRouter = router({
  list: protectedProcedure
    .input(z.object({ objektId: z.string().optional(), einheitId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.wartungsaufgabe.findMany({
        where: { tenantId: ctx.tenantId, objektId: input?.objektId, einheitId: input?.einheitId },
        orderBy: { naechsteFaelligkeit: "asc" },
      });
    }),

  listFaelligIn: protectedProcedure
    .input(z.object({ tage: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const bis = new Date();
      bis.setDate(bis.getDate() + input.tage);
      return ctx.db.wartungsaufgabe.findMany({
        where: { tenantId: ctx.tenantId, naechsteFaelligkeit: { lte: bis } },
        orderBy: { naechsteFaelligkeit: "asc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      bezeichnung: z.string().min(1),
      kategorie: z.string().min(1),
      intervallMonate: z.number().int().min(1),
      naechsteFaelligkeit: z.date(),
      letzteAusfuehrung: z.date().optional(),
      objektId: z.string().optional(),
      einheitId: z.string().optional(),
      verantwortlicher: z.string().optional(),
      notiz: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const aufgabe = await ctx.db.wartungsaufgabe.create({
        data: { tenantId: ctx.tenantId, ...input },
      });
      await logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, aktion: "WARTUNGSAUFGABE_ERSTELLT", entitaet: "Wartungsaufgabe", entitaetId: aufgabe.id, neuWert: aufgabe });
      return aufgabe;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      bezeichnung: z.string().min(1).optional(),
      kategorie: z.string().optional(),
      intervallMonate: z.number().int().min(1).optional(),
      naechsteFaelligkeit: z.date().optional(),
      letzteAusfuehrung: z.date().optional(),
      verantwortlicher: z.string().optional(),
      notiz: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const aufgabe = await ctx.db.wartungsaufgabe.update({ where: { id, tenantId: ctx.tenantId }, data });
      await logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, aktion: "WARTUNGSAUFGABE_GEAENDERT", entitaet: "Wartungsaufgabe", entitaetId: id, neuWert: aufgabe });
      return aufgabe;
    }),

  erledigt: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Mark as done and calculate next due date
      const aufgabe = await ctx.db.wartungsaufgabe.findUnique({ where: { id: input.id, tenantId: ctx.tenantId } });
      if (!aufgabe) throw new Error("Nicht gefunden");

      const naechste = new Date(aufgabe.naechsteFaelligkeit);
      naechste.setMonth(naechste.getMonth() + aufgabe.intervallMonate);

      const updated = await ctx.db.wartungsaufgabe.update({
        where: { id: input.id, tenantId: ctx.tenantId },
        data: { letzteAusfuehrung: new Date(), naechsteFaelligkeit: naechste },
      });
      await logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, aktion: "WARTUNGSAUFGABE_ERLEDIGT", entitaet: "Wartungsaufgabe", entitaetId: input.id });
      return updated;
    }),

  undoErledigt: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const a = await ctx.db.wartungsaufgabe.findUniqueOrThrow({ where: { id: input.id, tenantId: ctx.tenantId } });
      if (!a.letzteAusfuehrung) return a;
      // Fälligkeit zurücksetzen: naechsteFaelligkeit - intervallMonate
      const prev = new Date(a.naechsteFaelligkeit);
      prev.setMonth(prev.getMonth() - a.intervallMonate);
      const updated = await ctx.db.wartungsaufgabe.update({
        where: { id: input.id, tenantId: ctx.tenantId },
        data: { letzteAusfuehrung: null, naechsteFaelligkeit: prev },
      });
      await logAudit({ tenantId: ctx.tenantId, userId: ctx.userId, aktion: "WARTUNGSAUFGABE_UNDO", entitaet: "Wartungsaufgabe", entitaetId: input.id });
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.wartungsaufgabe.delete({ where: { id: input.id, tenantId: ctx.tenantId } });
      return true;
    }),
});
