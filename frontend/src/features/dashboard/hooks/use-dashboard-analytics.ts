import { useQuery } from "@tanstack/react-query";

import { getDashboardAnalyticsSource } from "@/features/dashboard/services/dashboard.service";

import type {
  DashboardAnalytics,
  PipelineStageAnalytics,
} from "@/features/dashboard/types/dashboard.types";

import {
  clientStatuses,
  type ClientStatus,
} from "@/features/clients/types/client.types";

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

function normalizePipelineStages(
  pipelineStages: PipelineStageAnalytics[]
) {
  const countByStatus = new Map<ClientStatus, number>();

  pipelineStages.forEach((stage) => {
    if (
      clientStatuses.includes(
        stage.status as ClientStatus
      )
    ) {
      countByStatus.set(
        stage.status as ClientStatus,
        stage.count
      );
    }
  });

  return clientStatuses.map((status) => ({
    status,
    label: formatStatusLabel(status),
    count: countByStatus.get(status) ?? 0,
    fill: pipelineStageColors[status],
  }));
}

export function useDashboardAnalytics() {
  const query = useQuery({
    queryKey: dashboardAnalyticsQueryKey,
    queryFn: async (): Promise<DashboardAnalytics> => {
      const analytics =
        await getDashboardAnalyticsSource();

      return {
        ...analytics,
        pipelineStages: normalizePipelineStages(
          analytics.pipelineStages
        ),
      };
    },
  });

  return {
    ...query,
    analytics: query.data ?? null,
  };
}
