import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Create context for tRPC requests
 * Includes session, database, and tenant information
 */
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    db,
    session,
    tenantId: (session?.user as any)?.tenantId || null,
    userId: (session?.user as any)?.id || null,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

/**
 * Public procedure - no authentication required
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  if (!ctx.session || !ctx.tenantId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session,
      tenantId: ctx.tenantId,
      userId: ctx.userId!,
    },
  });
});

export const router = t.router;
export const middleware = t.middleware;
