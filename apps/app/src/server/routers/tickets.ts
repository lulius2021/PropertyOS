/**
 * Tickets tRPC Router
 * Handles ticket management system
 */

import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { logAudit } from "../middleware/audit";

export const ticketsRouter = router({
  /**
   * Liste aller Tickets
   */
  list: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["ERFASST", "IN_BEARBEITUNG", "ZUR_PRUEFUNG", "ABGESCHLOSSEN"])
            .optional(),
          kategorie: z
            .enum(["SCHADENSMELDUNG", "WARTUNG", "ANFRAGE", "BESCHWERDE", "SANIERUNG"])
            .optional(),
          prioritaet: z.enum(["NIEDRIG", "MITTEL", "HOCH", "KRITISCH"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.ticket.findMany({
        where: {
          tenantId: ctx.tenantId,
          status: input?.status,
          kategorie: input?.kategorie,
          prioritaet: input?.prioritaet,
        },
        include: {
          _count: {
            select: { kommentare: true, dokumente: true },
          },
        },
        orderBy: [
          { status: "asc" }, // ERFASST first
          { prioritaet: "desc" }, // KRITISCH first
          { createdAt: "desc" },
        ],
      });
    }),

  /**
   * Einzelnes Ticket abrufen
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.ticket.findUnique({
        where: {
          id: input.id,
          tenantId: ctx.tenantId,
        },
        include: {
          kommentare: {
            orderBy: { createdAt: "asc" },
          },
          dokumente: {
            orderBy: { hochgeladenAm: "desc" },
          },
        },
      });
    }),

  /**
   * Ticket erstellen
   */
  create: protectedProcedure
    .input(
      z.object({
        titel: z.string().min(1),
        beschreibung: z.string().min(1),
        kategorie: z.enum([
          "SCHADENSMELDUNG",
          "WARTUNG",
          "ANFRAGE",
          "BESCHWERDE",
          "SANIERUNG",
        ]),
        prioritaet: z.enum(["NIEDRIG", "MITTEL", "HOCH", "KRITISCH"]).default("MITTEL"),
        objektId: z.string().optional(),
        einheitId: z.string().optional(),
        verantwortlicher: z.string().optional(),
        frist: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.create({
        data: {
          tenantId: ctx.tenantId,
          titel: input.titel,
          beschreibung: input.beschreibung,
          kategorie: input.kategorie,
          prioritaet: input.prioritaet,
          objektId: input.objektId,
          einheitId: input.einheitId,
          verantwortlicher: input.verantwortlicher,
          frist: input.frist,
          ersteller: ctx.userId,
          status: "ERFASST",
        },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "TICKET_ERSTELLT",
        entitaet: "Ticket",
        entitaetId: ticket.id,
        neuWert: ticket,
      });

      return ticket;
    }),

  /**
   * Ticket aktualisieren
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        titel: z.string().min(1).optional(),
        beschreibung: z.string().min(1).optional(),
        kategorie: z
          .enum(["SCHADENSMELDUNG", "WARTUNG", "ANFRAGE", "BESCHWERDE", "SANIERUNG"])
          .optional(),
        prioritaet: z.enum(["NIEDRIG", "MITTEL", "HOCH", "KRITISCH"]).optional(),
        status: z
          .enum(["ERFASST", "IN_BEARBEITUNG", "ZUR_PRUEFUNG", "ABGESCHLOSSEN"])
          .optional(),
        verantwortlicher: z.string().optional(),
        frist: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const altesTicket = await ctx.db.ticket.findUnique({
        where: { id, tenantId: ctx.tenantId },
      });

      const ticket = await ctx.db.ticket.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "TICKET_GEAENDERT",
        entitaet: "Ticket",
        entitaetId: ticket.id,
        altWert: altesTicket,
        neuWert: ticket,
      });

      return ticket;
    }),

  /**
   * Kommentar hinzufügen
   */
  addComment: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const kommentar = await ctx.db.ticketKommentar.create({
        data: {
          tenantId: ctx.tenantId,
          ticketId: input.ticketId,
          text: input.text,
          verfasser: ctx.userId,
        },
      });

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "TICKET_KOMMENTAR_HINZUGEFUEGT",
        entitaet: "TicketKommentar",
        entitaetId: kommentar.id,
        neuWert: kommentar,
      });

      return kommentar;
    }),

  /**
   * Status ändern (mit Kommentar)
   */
  changeStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["ERFASST", "IN_BEARBEITUNG", "ZUR_PRUEFUNG", "ABGESCHLOSSEN"]),
        kommentar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Status aktualisieren
      const ticket = await ctx.db.ticket.update({
        where: { id: input.ticketId, tenantId: ctx.tenantId },
        data: { status: input.status },
      });

      // Optionaler Kommentar
      if (input.kommentar) {
        await ctx.db.ticketKommentar.create({
          data: {
            tenantId: ctx.tenantId,
            ticketId: input.ticketId,
            text: `Status geändert zu ${input.status}: ${input.kommentar}`,
            verfasser: ctx.userId,
          },
        });
      }

      await logAudit({
        tenantId: ctx.tenantId,
        userId: ctx.userId,
        aktion: "TICKET_STATUS_GEAENDERT",
        entitaet: "Ticket",
        entitaetId: ticket.id,
        neuWert: { status: input.status },
      });

      return ticket;
    }),

  /**
   * Statistiken für Dashboard
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [erfasst, inBearbeitung, kritisch] = await Promise.all([
      ctx.db.ticket.count({
        where: {
          tenantId: ctx.tenantId,
          status: "ERFASST",
        },
      }),
      ctx.db.ticket.count({
        where: {
          tenantId: ctx.tenantId,
          status: "IN_BEARBEITUNG",
        },
      }),
      ctx.db.ticket.count({
        where: {
          tenantId: ctx.tenantId,
          prioritaet: "KRITISCH",
          status: { not: "ABGESCHLOSSEN" },
        },
      }),
    ]);

    return {
      erfasst,
      inBearbeitung,
      kritisch,
    };
  }),
});
