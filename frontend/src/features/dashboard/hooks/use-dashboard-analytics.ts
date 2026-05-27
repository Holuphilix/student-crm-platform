import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  clientStatuses,
  type Client,
  type ClientStatus,
} from "@/features/clients/types/client.types";

import { getDashboardAnalyticsSource } from "@/features/dashboard/services/dashboard.service";
import type {
  DashboardAnalytics,
  PipelineStageAnalytics,
} from "@/features/dashboard/types/dashboard.types";

const dashboardAnalyticsQueryKey = [
  "dashboard-analytics",
];

const pipelineStageColors: Record<ClientStatus, string> = {
  lead: "#2563eb",
  qualified: "#0891b2",
  proposal: "#ca8a04",
  won: "#16a34a",
  lost: "#dc2626",
};

function formatStatusLabel(status: ClientStatus) {
  return status
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");
}

function buildPipelineStages(
  clients: Client[]
): PipelineStageAnalytics[] {
  return clientStatuses.map((status) => ({
    status,
    label: formatStatusLabel(status),
    count: clients.filter(
      (client) => client.status === status
    ).length,
    fill: pipelineStageColors[status],
  }));
}

function buildDashboardAnalytics(
  clients: Client[],
  totalConversations: number
): DashboardAnalytics {
  const pipelineStages = buildPipelineStages(clients);

  const getStageCount = (status: ClientStatus) =>
    pipelineStages.find((stage) => stage.status === status)
      ?.count ?? 0;

  return {
    kpis: {
      totalClients: clients.length,
      activeLeads: getStageCount("lead"),
      wonDeals: getStageCount("won"),
      lostDeals: getStageCount("lost"),
      totalConversations,
    },
    pipelineStages,
    recentClients: clients.slice(0, 5),
  };
}

export function useDashboardAnalytics() {
  const query = useQuery({
    queryKey: dashboardAnalyticsQueryKey,
    queryFn: getDashboardAnalyticsSource,
  });

  const analytics = useMemo(() => {
    if (!query.data) {
      return null;
    }

    return buildDashboardAnalytics(
      query.data.clients,
      query.data.totalConversations
    );
  }, [query.data]);

  return {
    ...query,
    analytics,
  };
}
