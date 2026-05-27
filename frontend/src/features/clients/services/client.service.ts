import { supabase } from "@/lib/supabase/supabase-client";

import type {
  Client,
  CreateClientPayload,
} from "@/features/clients/types/client.types";

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createClient(
  payload: CreateClientPayload
): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}