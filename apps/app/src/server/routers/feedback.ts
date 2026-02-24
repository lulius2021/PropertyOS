import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        nachricht: z.string().min(10).max(2000),
        bewertung: z.number().min(1).max(5).optional(),
        kategorie: z
          .enum(["ALLGEMEIN", "FEATURE", "BUG", "LOB"])
          .default("ALLGEMEIN"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.feedback.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          ...input,
        },
      });
    }),
});
