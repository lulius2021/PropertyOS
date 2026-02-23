import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const dokumenteRouter = router({
  upload: protectedProcedure
    .input(
      z.object({
        dateiname: z.string(),
        mimeType: z.string(),
        dateiinhalt: z.string(), // base64
        groesse: z.number(),
        typ: z.enum([
          "MIETVERTRAG",
          "MAHNUNG",
          "RECHNUNG",
          "ZAEHLERABLESUNG",
          "DARLEHEN",
          "SONSTIGES",
        ]),
        objektId: z.string().optional(),
        einheitId: z.string().optional(),
        notiz: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.dokument.create({
        data: {
          tenantId: ctx.tenantId,
          dateiname: input.dateiname,
          mimeType: input.mimeType,
          groesse: input.groesse,
          dateiinhalt: input.dateiinhalt,
          s3Key: `${ctx.tenantId}/${Date.now()}-${input.dateiname}`,
          typ: input.typ,
          objektId: input.objektId,
          einheitId: input.einheitId,
          notiz: input.notiz,
        },
      });
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          objektId: z.string().optional(),
          einheitId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.dokument.findMany({
        where: {
          tenantId: ctx.tenantId,
          objektId: input?.objektId,
          einheitId: input?.einheitId,
        },
        orderBy: { hochgeladenAm: "desc" },
      });
    }),
});
