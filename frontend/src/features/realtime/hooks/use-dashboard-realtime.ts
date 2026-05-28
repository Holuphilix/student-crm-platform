import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToRealtimeTables } from "@/features/realtime/services/realtime.service";

const dashboardRealtimeTables = [
  "clients",
  "deals",
  "conversations",
  "deal_notes",
  "deal_stage_history",
] as const;

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToRealtimeTables(
      [...dashboardRealtimeTables],
      () => {
        void queryClient.invalidateQueries({
          queryKey: ["dashboard-analytics"],
        });
      }
    );
  }, [queryClient]);
}
