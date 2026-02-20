/**
 * Plan-Info tRPC Router
 * Gibt Plan-Details des aktuellen Tenants zurück
 */

import { router, protectedProcedure } from "../trpc";
import { PLAN_LIMITS } from "@/lib/plan-config";

export const planRouter = router({
  info: protectedProcedure.query(async ({ ctx }) => {
    const limits = PLAN_LIMITS[ctx.plan] || PLAN_LIMITS.starter;

    const objekteCount = await ctx.db.objekt.count({
      where: { tenantId: ctx.tenantId },
    });

    return {
      plan: ctx.plan,
      label: limits.label,
      features: limits.features,
      maxObjekte: limits.maxObjekte === Infinity ? null : limits.maxObjekte,
      currentObjekte: objekteCount,
      objekteLimitReached:
        limits.maxObjekte !== Infinity && objekteCount >= limits.maxObjekte,
    };
  }),
});
