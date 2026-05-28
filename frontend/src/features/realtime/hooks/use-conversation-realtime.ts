import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { subscribeToRealtimeTables } from "@/features/realtime/services/realtime.service";

const conversationRealtimeTables = [
  "conversations",
] as const;

export function useConversationRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToRealtimeTables(
      [...conversationRealtimeTables],
      () => {
        void queryClient.invalidateQueries({
          queryKey: ["conversations"],
        });
      }
    );
  }, [queryClient]);
}
