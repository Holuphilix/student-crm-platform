import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDeal,
  getDeals,
  updateDealStage,
} from "@/features/deals/services/deal.service";

import type {
  CreateDealPayload,
  UpdateDealStagePayload,
} from "@/features/deals/types/deal.types";

const dealsQueryKey = ["deals"];

export function useDeals() {
  return useQuery({
    queryKey: dealsQueryKey,
    queryFn: getDeals,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDealPayload) =>
      createDeal(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: dealsQueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealId,
      payload,
    }: {
      dealId: string;
      payload: UpdateDealStagePayload;
    }) => updateDealStage(dealId, payload),

    onSuccess: (_deal, variables) => {
      queryClient.invalidateQueries({
        queryKey: dealsQueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ["deals", variables.dealId],
      });
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });
}
