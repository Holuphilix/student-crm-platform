import { apiClient } from "@/lib/api/client";

import type {
  ConversationMessage,
  AssignConversationPayload,
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

export async function assignConversation(
  conversationId: string,
  payload: AssignConversationPayload
): Promise<ConversationMessage[]> {
  return apiClient<ConversationMessage[]>(
    `/api/conversations/${conversationId}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}
