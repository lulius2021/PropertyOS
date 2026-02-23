import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const sucheRouter = router({
  global: protectedProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ ctx, input }) => {
      const q = input.query;
      const tenantId = ctx.tenantId;

      const [objekte, einheiten, mieter, tickets, mahnungen] = await Promise.all([
        ctx.db.objekt.findMany({
          where: { tenantId, OR: [{ bezeichnung: { contains: q, mode: "insensitive" } }, { strasse: { contains: q, mode: "insensitive" } }, { ort: { contains: q, mode: "insensitive" } }] },
          take: 5,
          select: { id: true, bezeichnung: true, strasse: true, ort: true },
        }),
        ctx.db.einheit.findMany({
          where: { tenantId, OR: [{ einheitNr: { contains: q, mode: "insensitive" } }, { objekt: { bezeichnung: { contains: q, mode: "insensitive" } } }] },
          take: 5,
          select: { id: true, einheitNr: true, typ: true, objektId: true, objekt: { select: { bezeichnung: true } } },
        }),
        ctx.db.mieter.findMany({
          where: { tenantId, OR: [{ nachname: { contains: q, mode: "insensitive" } }, { vorname: { contains: q, mode: "insensitive" } }, { firma: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] },
          take: 5,
          select: { id: true, vorname: true, nachname: true, firma: true, email: true },
        }),
        ctx.db.ticket.findMany({
          where: { tenantId, OR: [{ titel: { contains: q, mode: "insensitive" } }, { beschreibung: { contains: q, mode: "insensitive" } }] },
          take: 5,
          select: { id: true, titel: true, status: true, prioritaet: true, createdAt: true },
        }),
        ctx.db.mahnung.findMany({
          where: { tenantId, mietverhaeltnis: { mieter: { OR: [{ nachname: { contains: q, mode: "insensitive" } }, { vorname: { contains: q, mode: "insensitive" } }] } } },
          take: 3,
          select: { id: true, mahnstufe: true, status: true, mahnDatum: true, offenerBetrag: true, mietverhaeltnis: { include: { mieter: true } } },
        }),
      ]);

      return {
        objekte,
        einheiten,
        mieter,
        tickets,
        mahnungen: mahnungen.map((m) => ({ ...m, offenerBetrag: m.offenerBetrag.toString() })),
      };
    }),
});
