import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  type PlanFeature,
  type PlanName,
  PLAN_LIMITS,
  FEATURE_LABELS,
  getUpgradePlan,
} from "@/lib/plan-config";

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

  // Lade Tenant-Plan für alle geschützten Procedures
  const tenant = await ctx.db.tenant.findUnique({
    where: { id: ctx.tenantId },
    select: { plan: true },
  });

  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session,
      tenantId: ctx.tenantId,
      userId: ctx.userId!,
      plan: (tenant?.plan || "starter") as PlanName,
    },
  });
});

/**
 * Erstellt eine Feature-gated Procedure.
 * Wirft FORBIDDEN wenn der Tenant-Plan das Feature nicht enthält.
 */
export function createPlanGatedProcedure(requiredFeature: PlanFeature) {
  return protectedProcedure.use(async function checkPlanFeature(opts) {
    const { ctx } = opts;
    const planLimits = PLAN_LIMITS[ctx.plan];

    if (!planLimits || !planLimits.features.includes(requiredFeature)) {
      const upgradePlan = getUpgradePlan(ctx.plan);
      const featureLabel = FEATURE_LABELS[requiredFeature];
      const upgradeLabel = upgradePlan ? PLAN_LIMITS[upgradePlan].label : "einem höheren Plan";

      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${featureLabel} ist in Ihrem aktuellen Plan (${planLimits?.label || ctx.plan}) nicht verfügbar. Upgraden Sie auf ${upgradeLabel}, um diese Funktion zu nutzen.`,
      });
    }

    return opts.next({ ctx });
  });
}

/**
 * Prüft ob das Objekt-Limit des Plans erreicht ist.
 * Wirft FORBIDDEN wenn max erreicht.
 */
export async function checkObjektLimit(ctx: {
  db: typeof db;
  tenantId: string;
  plan: PlanName;
}) {
  const planLimits = PLAN_LIMITS[ctx.plan];
  if (!planLimits) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Ungültiger Plan." });
  }

  if (planLimits.maxObjekte === Infinity) return;

  const currentCount = await ctx.db.objekt.count({
    where: { tenantId: ctx.tenantId },
  });

  if (currentCount >= planLimits.maxObjekte) {
    const upgradePlan = getUpgradePlan(ctx.plan);
    const upgradeLabel = upgradePlan ? PLAN_LIMITS[upgradePlan].label : "einem höheren Plan";

    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Sie haben das Maximum von ${planLimits.maxObjekte} Objekten erreicht. Upgraden Sie auf ${upgradeLabel} für unbegrenzte Objekte.`,
    });
  }
}

export const router = t.router;
export const middleware = t.middleware;
