import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import type {
  Client,
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
