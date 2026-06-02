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
import { normalizeStage } from "@/features/deals/utils/stage-format";

const dashboardAnalyticsQueryKey = [
  "dashboard-analytics",
];

const pipelineStageColors: Record<ClientStatus, string> = {
  new_lead: "#64748b",
  contacted: "#2563eb",
  consultation_booked: "#7c3aed",
  documents_requested: "#f97316",
  application_started: "#eab308",
  submitted: "#06b6d4",
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
        normalizeStage(stage.status),
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
