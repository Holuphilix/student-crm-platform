import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToRealtimeTables } from "@/features/realtime/services/realtime.service";

const dealRealtimeTables = [
  "deals",
  "deal_notes",
  "deal_stage_history",
] as const;

export function useDealRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToRealtimeTables(
      [...dealRealtimeTables],
      () => {
        void queryClient.invalidateQueries({
          queryKey: ["deals"],
        });
      }
    );
  }, [queryClient]);
}
