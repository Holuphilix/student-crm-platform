import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToRealtimeTables } from "@/features/realtime/services/realtime.service";

const clientRealtimeTables = [
  "clients",
  "deals",
  "conversations",
  "deal_notes",
  "deal_stage_history",
] as const;

export function useClientRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToRealtimeTables(
      [...clientRealtimeTables],
      () => {
        void queryClient.invalidateQueries({
          queryKey: ["clients"],
        });
      }
    );
  }, [queryClient]);
}
