import { apiClient } from "@/lib/api/client";

import type {
  CreateDealPayload,
  Deal,
  DealWithClient,
  UpdateDealStagePayload,
} from "@/features/deals/types/deal.types";

export async function getDeals(): Promise<DealWithClient[]> {
  return apiClient<DealWithClient[]>("/api/deals");
}

export async function createDeal(
  payload: CreateDealPayload
): Promise<Deal> {
  return apiClient<Deal>("/api/deals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDealStage(
  dealId: string,
  payload: UpdateDealStagePayload
): Promise<Deal> {
  return apiClient<Deal>(
    `/api/deals/${dealId}/stage`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
