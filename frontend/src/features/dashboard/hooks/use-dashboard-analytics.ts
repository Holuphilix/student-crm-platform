import { useQuery } from "@tanstack/react-query";

import { getDashboardAnalyticsSource } from "@/features/dashboard/services/dashboard.service";

import type {
  DashboardAnalytics,
  PipelineStageAnalytics,
} from "@/features/dashboard/types/dashboard.types";

import type { ClientStatus } from "@/features/clients/types/client.types";

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

function attachPipelineColors(
  pipelineStages: PipelineStageAnalytics[]
) {
  return pipelineStages.map((stage) => ({
    ...stage,
    fill: pipelineStageColors[
      stage.status as ClientStatus
    ],
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
        pipelineStages: attachPipelineColors(
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