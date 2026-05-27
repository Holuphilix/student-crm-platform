import { supabase } from "@/lib/supabase/supabase-client";

import type {
  ConversationMessage,
  CreateConversationMessagePayload,
} from "@/features/conversations/types/conversation.types";

export async function getConversationMessages(): Promise<
  ConversationMessage[]
> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createConversationMessage(
  payload: CreateConversationMessagePayload
): Promise<ConversationMessage> {
  const { data, error } = await supabase
    .from("conversations")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
