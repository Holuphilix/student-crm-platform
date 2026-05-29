import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import type {
  ConversationMessage,
  CreateConversationMessagePayload,
} from "../types/domain";

export async function getConversations(
  supabase: SupabaseClient
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new HttpError(
      502,
      "CONVERSATIONS_FETCH_FAILED",
      error.message
    );
  }

  return (data ?? []) as ConversationMessage[];
}

export async function createConversationMessage(
  supabase: SupabaseClient,
  payload: CreateConversationMessagePayload,
  actorId: string
): Promise<ConversationMessage> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      ...payload,
      author_id: actorId,
    })
    .select()
    .single();

  if (error) {
    throw new HttpError(
      502,
      "CONVERSATION_CREATE_FAILED",
      error.message
    );
  }

  return data as ConversationMessage;
}
