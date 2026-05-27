import { apiClient } from "@/lib/api/client";

import type {
  ConversationMessage,
  CreateConversationMessagePayload,
} from "@/features/conversations/types/conversation.types";

export async function getConversationMessages(): Promise<
  ConversationMessage[]
> {
  return apiClient<ConversationMessage[]>(
    "/api/conversations"
  );
}

export async function createConversationMessage(
  payload: CreateConversationMessagePayload
): Promise<ConversationMessage> {
  return apiClient<ConversationMessage>(
    "/api/conversations",
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  );
}