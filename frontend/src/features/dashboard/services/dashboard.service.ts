import { apiClient } from "@/lib/api/client";

import type { DashboardAnalytics } from "@/features/dashboard/types/dashboard.types";

export async function getDashboardAnalyticsSource(): Promise<DashboardAnalytics> {
  return apiClient<DashboardAnalytics>(
    "/api/dashboard"
  );
}