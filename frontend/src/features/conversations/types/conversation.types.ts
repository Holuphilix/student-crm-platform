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
  message: string;
  sender: ConversationSender;
  created_at: string;
};

export type CreateConversationMessagePayload = {
  client_id: string;
  message: string;
  sender: ConversationSender;
};
