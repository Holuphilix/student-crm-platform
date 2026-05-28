import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDealNote,
  getDealDetail,
} from "@/features/deals/services/deal-notes.service";

import type { CreateDealNotePayload } from "@/features/deals/types/deal.types";

export function useDealDetail(dealId?: string) {
  return useQuery({
    queryKey: ["deals", dealId],
    queryFn: () => getDealDetail(dealId!),
    enabled: Boolean(dealId),
  });
}

export function useCreateDealNote(dealId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDealNotePayload) =>
      createDealNote(dealId!, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals", dealId],
      });
    },
  });
}
