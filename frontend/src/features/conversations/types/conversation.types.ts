export const conversationSenders = [
  "client",
  "agent",
] as const;

export type ConversationSender =
  (typeof conversationSenders)[number];

export type ConversationMessage = {
  id: string;
  client_id: string;
  author_id?: string | null;
  assigned_to?: string | null;
  status?: "open" | "pending" | "closed" | null;
  message: string;
  sender: ConversationSender;
  created_at: string;
  clients?: {
    profile_id?: string | null;
    owner_id?: string | null;
    full_name?: string | null;
    email?: string | null;
    company?: string | null;
    status?: string | null;
  } | null;
};

export type CreateConversationMessagePayload = {
  client_id: string;
  message: string;
  sender: ConversationSender;
};

export type AssignConversationPayload = {
  assigned_to: string | null;
};
