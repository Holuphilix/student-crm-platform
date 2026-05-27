import {
  MessageSquare,
  Trophy,
  UserRoundX,
  Users,
  UserSearch,
} from "lucide-react";

import { AnalyticsCard } from "@/features/dashboard/components/analytics-card";
import type { DashboardKpi } from "@/features/dashboard/types/dashboard.types";

type KpiSummaryProps = {
  kpis: DashboardKpi | null;
  isLoading?: boolean;
};

const emptyKpis: DashboardKpi = {
  totalClients: 0,
  activeLeads: 0,
  wonDeals: 0,
  lostDeals: 0,
  totalConversations: 0,
};

export function KpiSummary({
  kpis,
  isLoading = false,
}: KpiSummaryProps) {
  const values = kpis ?? emptyKpis;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <AnalyticsCard
        title="Total Clients"
        value={values.totalClients}
        icon={Users}
        isLoading={isLoading}
      />

      <AnalyticsCard
        title="Active Leads"
        value={values.activeLeads}
        icon={UserSearch}
        isLoading={isLoading}
      />

      <AnalyticsCard
        title="Won Deals"
        value={values.wonDeals}
        icon={Trophy}
        isLoading={isLoading}
      />

      <AnalyticsCard
        title="Lost Deals"
        value={values.lostDeals}
        icon={UserRoundX}
        isLoading={isLoading}
      />

      <AnalyticsCard
        title="Total Conversations"
        value={values.totalConversations}
        icon={MessageSquare}
        isLoading={isLoading}
      />
    </div>
  );
}
