import {
  MessageSquare,
  BriefcaseBusiness,
  Trophy,
  UserRoundX,
  Users,
  UserSearch,
  Inbox,
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
  activeDeals: 0,
  wonDeals: 0,
  lostDeals: 0,
  totalConversations: 0,
  unassignedConversations: 0,
  totalSalesUsers: 0,
};

export function KpiSummary({
  kpis,
  isLoading = false,
}: KpiSummaryProps) {
  const values = kpis ?? emptyKpis;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsCard
        title="Total Clients"
        value={values.totalClients}
        icon={Users}
        isLoading={isLoading}
        to="/clients"
      />

      <AnalyticsCard
        title="Active Deals"
        value={values.activeDeals}
        icon={BriefcaseBusiness}
        isLoading={isLoading}
        to="/deals?filter=active"
      />

      <AnalyticsCard
        title="Won Deals"
        value={values.wonDeals}
        icon={Trophy}
        isLoading={isLoading}
        to="/deals?stage=won"
      />

      <AnalyticsCard
        title="Lost Deals"
        value={values.lostDeals}
        icon={UserRoundX}
        isLoading={isLoading}
        to="/deals?stage=lost"
      />

      <AnalyticsCard
        title="Total Conversations"
        value={values.totalConversations}
        icon={MessageSquare}
        isLoading={isLoading}
        to="/conversations"
      />

      <AnalyticsCard
        title="Unassigned Conversations"
        value={values.unassignedConversations}
        icon={Inbox}
        isLoading={isLoading}
        to="/conversations?filter=unassigned"
      />

      <AnalyticsCard
        title="Total Sales Users"
        value={values.totalSalesUsers}
        icon={UserSearch}
        isLoading={isLoading}
        to="/users"
      />
    </div>
  );
}
