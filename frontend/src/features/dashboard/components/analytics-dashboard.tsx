import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { DealDistributionChart } from "@/features/dashboard/components/deal-distribution-chart";
import { DealsByOwnerChart } from "@/features/dashboard/components/deals-by-owner-chart";
import { KpiSummary } from "@/features/dashboard/components/kpi-summary";
import { PipelineStageChart } from "@/features/dashboard/components/pipeline-stage-chart";
import { RecentActivityTimeline } from "@/features/dashboard/components/recent-activity-timeline";
import { RecentClientActivity } from "@/features/dashboard/components/recent-client-activity";
import { useDashboardAnalytics } from "@/features/dashboard/hooks/use-dashboard-analytics";

export function AnalyticsDashboard() {
  const {
    analytics,
    isLoading,
    isError,
  } = useDashboardAnalytics();

  if (isError) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">
            Failed to load dashboard analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <KpiSummary
        kpis={analytics?.kpis ?? null}
        isLoading={isLoading}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DealDistributionChart
          data={analytics?.pipelineStages ?? []}
          isLoading={isLoading}
        />

        <PipelineStageChart
          data={analytics?.pipelineStages ?? []}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DealsByOwnerChart
          data={analytics?.dealsByOwner ?? []}
          isLoading={isLoading}
        />

        <RecentActivityTimeline
          activities={analytics?.recentActivity ?? []}
          isLoading={isLoading}
        />
      </div>

      <RecentClientActivity
        clients={analytics?.recentClients ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
