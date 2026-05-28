import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import type {
  CreateDealNotePayload,
  CreateDealPayload,
  Deal,
  DealNote,
  DealStage,
  DealStageHistory,
  DealWithClient,
  UpdateDealStagePayload,
} from "../types/domain";

export async function getDeals(
  supabase: SupabaseClient
): Promise<DealWithClient[]> {
  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      clients (
        full_name,
        email,
        company
      )
    `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new HttpError(
      502,
      "DEALS_FETCH_FAILED",
      error.message
    );
  }

  return (data ?? []) as DealWithClient[];
}

async function recordDealStageHistory(
  supabase: SupabaseClient,
  payload: {
    deal_id: string;
    from_stage?: DealStage | null;
    to_stage: DealStage;
    changed_by: string | null;
  }
): Promise<DealStageHistory> {
  const { data, error } = await supabase
    .from("deal_stage_history")
    .insert({
      deal_id: payload.deal_id,
      from_stage: payload.from_stage ?? null,
      to_stage: payload.to_stage,
      changed_by: payload.changed_by,
    })
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "DEAL_STAGE_HISTORY_CREATE_FAILED",
      error.message
    );
  }

  return data as DealStageHistory;
}

export async function createDeal(
  supabase: SupabaseClient,
  payload: CreateDealPayload,
  actorId: string
): Promise<Deal> {
  const ownerId = payload.owner_id ?? actorId;

  const { data, error } = await supabase
    .from("deals")
    .insert({
      client_id: payload.client_id,
      owner_id: ownerId,
      title: payload.title,
      value_amount: payload.value_amount ?? null,
      expected_intake: payload.expected_intake ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "DEAL_CREATE_FAILED",
      error.message
    );
  }

  const deal = data as Deal;

  await recordDealStageHistory(supabase, {
    deal_id: deal.id,
    from_stage: null,
    to_stage: deal.stage,
    changed_by: actorId,
  });

  return deal;
}

export async function updateDealStage(
  supabase: SupabaseClient,
  dealId: string,
  payload: UpdateDealStagePayload,
  actorId: string
): Promise<Deal> {
  const { data: existingDeal, error: fetchError } =
    await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single();

  if (fetchError || !existingDeal) {
    throw new HttpError(
      404,
      "DEAL_NOT_FOUND",
      "Deal not found."
    );
  }

  const currentDeal = existingDeal as Deal;

  if (currentDeal.stage === payload.stage) {
    return currentDeal;
  }

  const { data, error } = await supabase
    .from("deals")
    .update({
      stage: payload.stage,
      lost_reason:
        payload.stage === "lost"
          ? payload.lost_reason ?? null
          : null,
    })
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "DEAL_STAGE_UPDATE_FAILED",
      error.message
    );
  }

  await recordDealStageHistory(supabase, {
    deal_id: dealId,
    from_stage: currentDeal.stage,
    to_stage: payload.stage,
    changed_by: actorId,
  });

  return data as Deal;
}

export async function addDealNote(
  supabase: SupabaseClient,
  payload: CreateDealNotePayload
): Promise<DealNote> {
  const { data, error } = await supabase
    .from("deal_notes")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "DEAL_NOTE_CREATE_FAILED",
      error.message
    );
  }

  return data as DealNote;
}
