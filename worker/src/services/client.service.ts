import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertCanAccessClient,
  canAccessDeal,
  isAdminManagerRole,
  isClientRole,
  isSalesRole,
  requireSalesOrAdminManager,
} from "../lib/authorization";
import { HttpError } from "../lib/http-error";
import {
  isCheckConstraintError,
  isMissingColumnError,
  toLegacyStage,
} from "../lib/legacy-stage";
import type { AuthenticatedUser } from "../types/env";
import type {
  Client,
  ClientDetail,
  ConversationMessage,
  CreateClientPayload,
  Deal,
  DealNote,
  DealStageHistory,
  UpdateClientPayload,
} from "../types/domain";

async function createClientRecordForActor(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<Client | null> {
  if (!actor.email) {
    return null;
  }

  const fullName =
    actor.profile.full_name?.trim() ||
    actor.email;

  const insertWithProfileResponse = await supabase
    .from("clients")
    .insert({
      profile_id: actor.id,
      full_name: fullName,
      email: actor.email,
      status: "new_lead",
    })
    .select()
    .single<Client>();

  if (!insertWithProfileResponse.error) {
    return insertWithProfileResponse.data;
  }

  const existingClientResponse = await supabase
    .from("clients")
    .select("*")
    .ilike("email", actor.email)
    .maybeSingle<Client>();

  if (
    existingClientResponse.data &&
    !existingClientResponse.error
  ) {
    return existingClientResponse.data;
  }

  const fallbackResponse = await supabase
    .from("clients")
    .insert({
      full_name: fullName,
      email: actor.email,
      status: "new_lead",
    })
    .select()
    .single<Client>();

  if (fallbackResponse.error) {
    throw new HttpError(
      502,
      "CLIENT_AUTO_CREATE_FAILED",
      fallbackResponse.error.message
    );
  }

  return fallbackResponse.data;
}

export async function getClients(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<Client[]> {
  if (isClientRole(actor.role)) {
    const profileResponse = await supabase
      .from("clients")
      .select("*")
      .eq("profile_id", actor.id)
      .order("created_at", {
        ascending: false,
      });

    if (!profileResponse.error) {
      const clients = (profileResponse.data ?? []) as Client[];

      if (clients.length > 0) {
        return clients;
      }

      const createdClient =
        await createClientRecordForActor(supabase, actor);

      return createdClient ? [createdClient] : [];
    }

    if (!isMissingColumnError(profileResponse.error)) {
      throw new HttpError(
        502,
        "CLIENTS_FETCH_FAILED",
        profileResponse.error.message
      );
    }

    if (!actor.email) {
      return [];
    }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .ilike("email", actor.email)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw new HttpError(
        502,
        "CLIENTS_FETCH_FAILED",
        error.message
      );
    }

    const clients = (data ?? []) as Client[];

    if (clients.length > 0) {
      return clients;
    }

    const createdClient =
      await createClientRecordForActor(supabase, actor);

    return createdClient ? [createdClient] : [];
  }

  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  const { data, error } = await query;

  if (error) {
    throw new HttpError(
      502,
      "CLIENTS_FETCH_FAILED",
      error.message
    );
  }

  return (data ?? []) as Client[];
}

export async function createClient(
  supabase: SupabaseClient,
  payload: CreateClientPayload,
  actor: AuthenticatedUser
): Promise<Client> {
  requireSalesOrAdminManager(actor);

  const insertPayload = {
    ...payload,
    owner_id: actor.id,
  };

  const { data, error } = await supabase
    .from("clients")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    if (
      isMissingColumnError(error) ||
      isCheckConstraintError(error)
    ) {
      const fallbackPayload = {
        ...payload,
        status: toLegacyStage(payload.status),
      };

      const {
        data: fallbackData,
        error: fallbackError,
      } = await supabase
        .from("clients")
        .insert(fallbackPayload)
        .select()
        .single();

      if (!fallbackError) {
        return fallbackData as Client;
      }
    }

    throw new HttpError(
      502,
      "CLIENT_CREATE_FAILED",
      error.message
    );
  }

  return data as Client;
}

export async function updateClient(
  supabase: SupabaseClient,
  clientId: string,
  payload: UpdateClientPayload,
  actor: AuthenticatedUser
): Promise<Client> {
  const { data: existingClient, error: fetchError } =
    await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle<Client>();

  if (fetchError) {
    throw new HttpError(
      502,
      "CLIENT_FETCH_FAILED",
      fetchError.message
    );
  }

  if (!existingClient) {
    throw new HttpError(
      404,
      "CLIENT_NOT_FOUND",
      "Client not found."
    );
  }

  assertCanAccessClient(actor, existingClient);

  if (isSalesRole(actor.role)) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "Sales users cannot update client profile records."
    );
  }

  const updatePayload = {
    ...payload,
    updated_at: new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from("clients")
    .update(updatePayload)
    .eq("id", clientId)
    .select()
    .single<Client>();

  if (error && isMissingColumnError(error)) {
    const fallbackPayload = {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone,
    };

    const fallbackResponse = await supabase
      .from("clients")
      .update(fallbackPayload)
      .eq("id", clientId)
      .select()
      .single<Client>();

    data = fallbackResponse.data;
    error = fallbackResponse.error;
  }

  if (error || !data) {
    throw new HttpError(
      502,
      "CLIENT_UPDATE_FAILED",
      error?.message ?? "Client could not be updated."
    );
  }

  if (isClientRole(actor.role)) {
    const profileUpdate = {
      full_name: data.full_name,
      email: data.email,
    };

    await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", actor.id);

    await supabase.auth.admin.updateUserById(actor.id, {
      user_metadata: {
        full_name: data.full_name,
      },
    });
  }

  return data;
}

export async function getClientDetail(
  supabase: SupabaseClient,
  clientId: string,
  actor: AuthenticatedUser
): Promise<ClientDetail> {
  const { data: client, error: clientError } =
    await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

  if (clientError) {
    throw new HttpError(
      502,
      "CLIENT_DETAIL_FETCH_FAILED",
      clientError.message
    );
  }

  if (!client) {
    throw new HttpError(
      404,
      "CLIENT_NOT_FOUND",
      "Client not found."
    );
  }

  const resolvedClient = client as Client;

  assertCanAccessClient(actor, resolvedClient);

  const {
    data: conversations,
    error: conversationsError,
  } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", {
      ascending: false,
    });

  if (conversationsError) {
    throw new HttpError(
      502,
      "CLIENT_CONVERSATIONS_FETCH_FAILED",
      conversationsError.message
    );
  }

  const { data: dealsData, error: dealsError } =
    await supabase
      .from("deals")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", {
        ascending: false,
      });

  if (dealsError) {
    throw new HttpError(
      502,
      "CLIENT_DEALS_FETCH_FAILED",
      dealsError.message
    );
  }

  const deals = ((dealsData ?? []) as Deal[]).filter(
    (deal) =>
      canAccessDeal(actor, {
        ...deal,
        clients: {
          profile_id: resolvedClient.profile_id,
          email: resolvedClient.email,
          full_name: resolvedClient.full_name,
          company: resolvedClient.company,
        },
      })
  );

  const dealIds = deals.map((deal) => deal.id);

  let notes: DealNote[] = [];
  let stageHistory: DealStageHistory[] = [];

  if (dealIds.length > 0) {
    const [notesResponse, historyResponse] =
      await Promise.all([
        isClientRole(actor.role)
          ? Promise.resolve({
              data: [],
              error: null,
            })
          : supabase
              .from("deal_notes")
              .select("*")
              .in("deal_id", dealIds)
              .order("created_at", {
                ascending: false,
              }),

        supabase
          .from("deal_stage_history")
          .select("*")
          .in("deal_id", dealIds)
          .order("created_at", {
            ascending: false,
          }),
      ]);

    if (notesResponse.error) {
      throw new HttpError(
        502,
        "CLIENT_DEAL_NOTES_FETCH_FAILED",
        notesResponse.error.message
      );
    }

    if (historyResponse.error) {
      throw new HttpError(
        502,
        "CLIENT_DEAL_HISTORY_FETCH_FAILED",
        historyResponse.error.message
      );
    }

    notes = (notesResponse.data ?? []) as DealNote[];
    stageHistory =
      (historyResponse.data ?? []) as DealStageHistory[];
  }

  return {
    client: resolvedClient,
    conversations:
      (conversations ?? []) as ConversationMessage[],
    deals,
    notes:
      isAdminManagerRole(actor.role) ||
      isSalesRole(actor.role)
        ? notes
        : [],
    stageHistory,
  };
}
