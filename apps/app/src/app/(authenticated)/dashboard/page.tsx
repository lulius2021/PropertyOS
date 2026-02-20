"use client";

import { trpc } from "@/lib/trpc/client";
import { SimpleDashboard } from "@/components/dashboard/SimpleDashboard";

export default function DashboardPage() {
  const { data: kpis, isLoading } = trpc.reporting.dashboardKPIs.useQuery();

  return <SimpleDashboard data={kpis} isLoading={isLoading} />;
}
