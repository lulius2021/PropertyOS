/**
 * Billing tRPC Router
 * Stripe Subscription Details, Referral Stats, Portal Session
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { PLAN_LIMITS, type PlanName } from "@/lib/plan-config";

export const billingRouter = router({
  /**
   * Subscription-Details aus DB + Stripe
   */
  getBillingInfo: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,
        billingInterval: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        referralCode: true,
      },
    });

    if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });

    const planConfig = PLAN_LIMITS[tenant.plan as PlanName] ?? PLAN_LIMITS.starter;

    // Stripe-Details wenn konfiguriert
    let nextInvoiceAmount: number | null = null;
    let nextInvoiceDate: Date | null = null;

    if (tenant.stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const { stripe } = await import("@/lib/stripe");
        const [upcomingInvoice, customer] = await Promise.all([
          stripe.invoices.createPreview({
            customer: tenant.stripeCustomerId!,
            subscription: tenant.stripeSubscriptionId!,
          }),
          stripe.customers.retrieve(tenant.stripeCustomerId!),
        ]);

        nextInvoiceAmount = upcomingInvoice.amount_due / 100;
        nextInvoiceDate = upcomingInvoice.period_end
          ? new Date(upcomingInvoice.period_end * 1000)
          : null;

        // Customer Balance (als Gutschrift)
        const balance =
          "balance" in customer && typeof customer.balance === "number"
            ? customer.balance / 100
            : 0;

        return {
          plan: tenant.plan,
          planLabel: planConfig.label,
          billingInterval: tenant.billingInterval ?? "monthly",
          subscriptionStatus: tenant.subscriptionStatus ?? "active",
          trialEndsAt: tenant.trialEndsAt,
          currentPeriodEnd: tenant.currentPeriodEnd,
          referralCode: tenant.referralCode,
          nextInvoiceAmount,
          nextInvoiceDate,
          customerBalance: balance, // negativ = Guthaben
        };
      } catch (err) {
        console.error("Stripe billing info error:", err);
      }
    }

    return {
      plan: tenant.plan,
      planLabel: planConfig.label,
      billingInterval: tenant.billingInterval ?? "monthly",
      subscriptionStatus: tenant.subscriptionStatus ?? "active",
      trialEndsAt: tenant.trialEndsAt,
      currentPeriodEnd: tenant.currentPeriodEnd,
      referralCode: tenant.referralCode,
      nextInvoiceAmount: null,
      nextInvoiceDate: null,
      customerBalance: 0,
    };
  }),

  /**
   * Referral-Statistiken: Code, geworbene Nutzer, Gutschriften
   */
  getReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: {
        referralCode: true,
        referralCredits: {
          orderBy: { createdAt: "desc" },
          include: {
            tenant: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!tenant) throw new TRPCError({ code: "NOT_FOUND" });

    // Geworbene Tenants über referredBy
    const referredTenants = await ctx.db.tenant.findMany({
      where: { referredBy: tenant.referralCode ?? undefined },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscriptionStatus: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      referralCode: tenant.referralCode,
      referred: referredTenants,
      credits: tenant.referralCredits.map((c) => ({
        id: c.id,
        referredTenantId: c.referredTenantId,
        amount: c.amount,
        status: c.status,
        createdAt: c.createdAt,
        appliedAt: c.appliedAt,
      })),
      totalEarned: tenant.referralCredits.reduce((sum, c) => sum + c.amount, 0),
    };
  }),

  /**
   * Stripe Billing Portal URL erstellen
   */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Stripe ist nicht konfiguriert.",
      });
    }

    const tenant = await ctx.db.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: { stripeCustomerId: true },
    });

    if (!tenant?.stripeCustomerId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Kein Stripe-Customer gefunden.",
      });
    }

    const { stripe } = await import("@/lib/stripe");
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/einstellungen?tab=abonnement`,
    });

    return { url: session.url };
  }),

  /**
   * Öffentliche Procedure: Referral-Code validieren (für Registrierung)
   */
  validateReferralCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();

      const tenant = await ctx.db.tenant.findUnique({
        where: { referralCode: code },
        select: { id: true, name: true },
      });

      return { valid: !!tenant };
    }),
});
