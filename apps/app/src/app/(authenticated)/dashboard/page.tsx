"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { SimpleDashboard } from "@/components/dashboard/SimpleDashboard";

export default function DashboardPage() {
  const { data: kpis, isLoading } = trpc.reporting.dashboardKPIs.useQuery();
  const saveSnapshots = trpc.statistik.saveSnapshots.useMutation();
  const snapshotDone = useRef(false);

  // Beim ersten Laden Snapshots speichern (nur einmal pro Session)
  useEffect(() => {
    if (kpis && !snapshotDone.current) {
      snapshotDone.current = true;
      saveSnapshots.mutate();
    }
  }, [kpis]); // eslint-disable-line react-hooks/exhaustive-deps

  return <SimpleDashboard data={kpis} isLoading={isLoading} />;
}
