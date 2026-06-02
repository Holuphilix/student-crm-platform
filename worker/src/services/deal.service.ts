import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertCanAccessDeal,
  assertCanMutateDeal,
  canAccessDeal,
  isAdminManagerRole,
  isClientRole,
  requireAdminManager,
  requireSalesOrAdminManager,
} from "../lib/authorization";
import { HttpError } from "../lib/http-error";
import {
  isCheckConstraintError,
  isStageCompatibilityError,
  isMissingColumnError,
  toCurrentStage,
  toLegacyStage,
} from "../lib/legacy-stage";
import type { AuthenticatedUser } from "../types/env";
import type {
  CreateDealNotePayload,
  CreateDealPayload,
  Deal,
  DealActivityItem,
  DealDetail,
  DealNote,
  DealStage,
  DealStageHistory,
  DealWithClient,
  UpdateDealOwnerPayload,
  UpdateDealStagePayload,
} from "../types/domain";

export async function getDeals(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<DealWithClient[]> {
  let { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      clients (
        profile_id,
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
    if (isMissingColumnError(error)) {
      const fallbackResponse = await supabase
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

      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }
  }

  if (error) {
    throw new HttpError(
      502,
      "DEALS_FETCH_FAILED",
      error.message
    );
  }

  const deals = (data ?? []) as DealWithClient[];

  if (isAdminManagerRole(actor.role)) {
    return deals;
  }

  return deals.filter((deal) =>
    canAccessDeal(actor, deal)
  );
}

function buildDealActivityFeed(payload: {
  deal: Deal;
  notes: DealNote[];
  stageHistory: DealStageHistory[];
}): DealActivityItem[] {
  const { deal, notes, stageHistory } = payload;

  const activityFeed: DealActivityItem[] = [
    {
      id: `deal-created-${deal.id}`,
      type: "deal_created",
      title: "Deal created",
      description: deal.title,
      created_at: deal.created_at,
      metadata: {
        deal_id: deal.id,
        stage: deal.stage,
      },
    },
    ...notes.map((note) => ({
      id: `deal-note-${note.id}`,
      type: "note_created" as const,
      title: "Note added",
      description: note.body,
      created_at: note.created_at,
      metadata: {
        note_id: note.id,
        author_id: note.author_id,
      },
    })),
    ...stageHistory.map((history) => ({
      id: `deal-stage-${history.id}`,
      type: "stage_changed" as const,
      title: "Stage changed",
      description: `Moved from ${history.from_stage ?? "none"} to ${history.to_stage}.`,
      created_at: history.created_at,
      metadata: {
        from_stage: history.from_stage,
        to_stage: history.to_stage,
        changed_by: history.changed_by,
      },
    })),
  ];

  return activityFeed.sort(
    (firstActivity, secondActivity) =>
      new Date(secondActivity.created_at).getTime() -
      new Date(firstActivity.created_at).getTime()
  );
}

export async function getDealDetail(
  supabase: SupabaseClient,
  dealId: string,
  actor: AuthenticatedUser
): Promise<DealDetail> {
  let { data: deal, error: dealError } =
    await supabase
      .from("deals")
      .select(
        `
        *,
        clients (
          profile_id,
          full_name,
          email,
          company
        )
      `
      )
      .eq("id", dealId)
      .maybeSingle();

  if (dealError && isMissingColumnError(dealError)) {
    const fallbackResponse = await supabase
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
      .eq("id", dealId)
      .maybeSingle();

    deal = fallbackResponse.data;
    dealError = fallbackResponse.error;
  }

  if (dealError) {
    throw new HttpError(
      502,
      "DEAL_DETAIL_FETCH_FAILED",
      dealError.message
    );
  }

  if (!deal) {
    throw new HttpError(
      404,
      "DEAL_NOT_FOUND",
      "Deal not found."
    );
  }

  const resolvedDeal = deal as DealWithClient;

  assertCanAccessDeal(actor, resolvedDeal);

  const [notesResponse, historyResponse] =
    await Promise.all([
      supabase
        .from("deal_notes")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("deal_stage_history")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", {
          ascending: false,
        }),
    ]);

  if (notesResponse.error) {
    throw new HttpError(
      502,
      "DEAL_NOTES_FETCH_FAILED",
      notesResponse.error.message
    );
  }

  if (historyResponse.error) {
    throw new HttpError(
      502,
      "DEAL_STAGE_HISTORY_FETCH_FAILED",
      historyResponse.error.message
    );
  }

  const notes = isClientRole(actor.role)
    ? []
    : ((notesResponse.data ?? []) as DealNote[]);
  const stageHistory = (
    (historyResponse.data ?? []) as DealStageHistory[]
  ).map((history) => ({
    ...history,
    from_stage: history.from_stage
      ? toCurrentStage(history.from_stage)
      : null,
    to_stage: toCurrentStage(history.to_stage),
  }));

  return {
    deal: resolvedDeal,
    notes,
    stageHistory,
    activityFeed: buildDealActivityFeed({
      deal: resolvedDeal as Deal,
      notes,
      stageHistory,
    }),
  };
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
    if (isStageCompatibilityError(error)) {
      const {
        data: fallbackData,
        error: fallbackError,
      } = await supabase
        .from("deal_stage_history")
        .insert({
          deal_id: payload.deal_id,
          from_stage: payload.from_stage
            ? toLegacyStage(payload.from_stage)
            : null,
          to_stage: toLegacyStage(payload.to_stage),
          changed_by: payload.changed_by,
        })
        .select()
        .single();

      if (!fallbackError) {
        return fallbackData as DealStageHistory;
      }
    }

    throw new HttpError(
      502,
      "DEAL_STAGE_HISTORY_CREATE_FAILED",
      error.message
    );
  }

  return data as DealStageHistory;
}

async function syncClientStatusToDealStage(
  supabase: SupabaseClient,
  payload: {
    clientId: string;
    stage: DealStage;
  }
) {
  const { error } = await supabase
    .from("clients")
    .update({
      status: payload.stage,
    })
    .eq("id", payload.clientId);

  if (error) {
    if (isStageCompatibilityError(error)) {
      const { error: fallbackError } = await supabase
        .from("clients")
        .update({
          status: toLegacyStage(payload.stage),
        })
        .eq("id", payload.clientId);

      if (!fallbackError) {
        return;
      }
    }

    throw new HttpError(
      502,
      "CLIENT_STATUS_SYNC_FAILED",
      error.message
    );
  }
}

export async function createDeal(
  supabase: SupabaseClient,
  payload: CreateDealPayload,
  actor: AuthenticatedUser
): Promise<Deal> {
  requireSalesOrAdminManager(actor);

  const insertPayload = {
    client_id: payload.client_id,
    owner_id:
      isAdminManagerRole(actor.role) &&
      payload.owner_id
        ? payload.owner_id
        : actor.id,
    title: payload.title,
    stage: "new_lead",
    value_amount: payload.value_amount ?? null,
    expected_intake: payload.expected_intake ?? null,
  };

  const { data, error } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    if (
      isMissingColumnError(error) ||
      isStageCompatibilityError(error)
    ) {
      const {
        data: fallbackData,
        error: fallbackError,
      } = await supabase
        .from("deals")
        .insert({
          client_id: payload.client_id,
          owner_id:
            isAdminManagerRole(actor.role) &&
            payload.owner_id
              ? payload.owner_id
              : actor.id,
          title: payload.title,
          stage: toLegacyStage("new_lead"),
          value_amount: payload.value_amount ?? null,
          expected_intake: payload.expected_intake ?? null,
        })
        .select()
        .single();

      if (!fallbackError) {
        const fallbackDeal = fallbackData as Deal;

        await syncClientStatusToDealStage(supabase, {
          clientId: fallbackDeal.client_id,
          stage: "new_lead",
        });

        await recordDealStageHistory(supabase, {
          deal_id: fallbackDeal.id,
          from_stage: null,
          to_stage: "new_lead",
          changed_by: actor.id,
        });

        return fallbackDeal;
      }
    }

    throw new HttpError(
      502,
      "DEAL_CREATE_FAILED",
      error.message
    );
  }

  const deal = data as Deal;

  await syncClientStatusToDealStage(supabase, {
    clientId: deal.client_id,
    stage: deal.stage,
  });

  await recordDealStageHistory(supabase, {
    deal_id: deal.id,
    from_stage: null,
    to_stage: deal.stage,
    changed_by: actor.id,
  });

  return deal;
}

export async function updateDealStage(
  supabase: SupabaseClient,
  dealId: string,
  payload: UpdateDealStagePayload,
  actor: AuthenticatedUser
): Promise<Deal> {
  let { data: existingDeal, error: fetchError } =
    await supabase
      .from("deals")
      .select(
        `
        *,
        clients (
          profile_id,
          full_name,
          email,
          company
        )
      `
      )
      .eq("id", dealId)
      .single();

  if (fetchError && isMissingColumnError(fetchError)) {
    const fallbackResponse = await supabase
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
      .eq("id", dealId)
      .single();

    existingDeal = fallbackResponse.data;
    fetchError = fallbackResponse.error;
  }

  if (fetchError || !existingDeal) {
    throw new HttpError(
      404,
      "DEAL_NOT_FOUND",
      "Deal not found."
    );
  }

  const currentDeal = existingDeal as DealWithClient;

  assertCanMutateDeal(actor, currentDeal);

  if (currentDeal.stage === payload.stage) {
    await syncClientStatusToDealStage(supabase, {
      clientId: currentDeal.client_id,
      stage: currentDeal.stage,
    });

    return currentDeal as Deal;
  }

  const updatePayload = {
    stage: payload.stage,
    lost_reason:
      payload.stage === "lost"
        ? payload.lost_reason ?? null
        : null,
  };

  let { data, error } = await supabase
    .from("deals")
    .update(updatePayload)
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    if (isStageCompatibilityError(error)) {
      const fallbackResponse = await supabase
        .from("deals")
        .update({
          ...updatePayload,
          stage: toLegacyStage(payload.stage),
        })
        .eq("id", dealId)
        .select()
        .single();

      data = fallbackResponse.data;
      error = fallbackResponse.error;
    }
  }

  if (error) {
    throw new HttpError(
      502,
      "DEAL_STAGE_UPDATE_FAILED",
      error.message
    );
  }

  const updatedDeal = data as Deal;

  await syncClientStatusToDealStage(supabase, {
    clientId: updatedDeal.client_id,
    stage: updatedDeal.stage,
  });

  await recordDealStageHistory(supabase, {
    deal_id: dealId,
    from_stage: currentDeal.stage,
    to_stage: payload.stage,
    changed_by: actor.id,
  });

  return updatedDeal;
}

export async function addDealNote(
  supabase: SupabaseClient,
  payload: CreateDealNotePayload,
  actor: AuthenticatedUser
): Promise<DealNote> {
  requireSalesOrAdminManager(actor);

  let { data: deal, error: dealError } =
    await supabase
      .from("deals")
      .select(
        `
        *,
        clients (
          profile_id,
          full_name,
          email,
          company
        )
      `
      )
      .eq("id", payload.deal_id)
      .single();

  if (dealError && isMissingColumnError(dealError)) {
    const fallbackResponse = await supabase
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
      .eq("id", payload.deal_id)
      .single();

    deal = fallbackResponse.data;
    dealError = fallbackResponse.error;
  }

  if (dealError || !deal) {
    throw new HttpError(
      404,
      "DEAL_NOT_FOUND",
      "Deal not found."
    );
  }

  assertCanMutateDeal(actor, deal as DealWithClient);

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

export async function updateDealOwner(
  supabase: SupabaseClient,
  dealId: string,
  payload: UpdateDealOwnerPayload,
  actor: AuthenticatedUser
): Promise<Deal> {
  requireAdminManager(actor);

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

  const { data, error } = await supabase
    .from("deals")
    .update({
      owner_id: payload.owner_id,
    })
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "DEAL_OWNER_UPDATE_FAILED",
      error.message
    );
  }

  await supabase.from("deal_notes").insert({
    deal_id: dealId,
    author_id: actor.id,
    body: `Deal ownership changed from ${existingDeal.owner_id ?? "unassigned"} to ${payload.owner_id ?? "unassigned"}.`,
  });

  return data as Deal;
}
