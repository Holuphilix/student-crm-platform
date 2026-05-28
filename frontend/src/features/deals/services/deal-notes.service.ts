import { apiClient } from "@/lib/api/client";

import type {
  CreateDealNotePayload,
  DealDetail,
  DealNote,
} from "@/features/deals/types/deal.types";

export async function getDealDetail(
  dealId: string
): Promise<DealDetail> {
  return apiClient<DealDetail>(`/api/deals/${dealId}`);
}

export async function createDealNote(
  dealId: string,
  payload: CreateDealNotePayload
): Promise<DealNote> {
  return apiClient<DealNote>(
    `/api/deals/${dealId}/notes`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
