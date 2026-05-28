import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import type {
  Client,
  ClientDetail,
  ConversationMessage,
  CreateClientPayload,
} from "../types/domain";

export async function getClients(
  supabase: SupabaseClient
): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
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

  return (data ?? []) as Client[];
}

export async function createClient(
  supabase: SupabaseClient,
  payload: CreateClientPayload
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "CLIENT_CREATE_FAILED",
      error.message
    );
  }

  return data as Client;
}

export async function getClientDetail(
  supabase: SupabaseClient,
  clientId: string
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

  return {
    client: client as Client,
    conversations:
      (conversations ?? []) as ConversationMessage[],
    deals: [],
    notes: [],
    stageHistory: [],
  };
}
