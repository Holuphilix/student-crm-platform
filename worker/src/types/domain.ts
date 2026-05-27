export const clientStatuses = [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export type ClientStatus =
  (typeof clientStatuses)[number];

export type Client = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: ClientStatus;
  created_at: string;
};

export type CreateClientPayload = {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ClientStatus;
};

export const conversationSenders = [
  "client",
  "agent",
] as const;

export type ConversationSender =
  (typeof conversationSenders)[number];

export type ConversationMessage = {
  id: string;
  client_id: string;
  message: string;
  sender: ConversationSender;
  created_at: string;
};

export type CreateConversationMessagePayload = {
  client_id: string;
  message: string;
  sender: ConversationSender;
};

export type PipelineStageAnalytics = {
  status: ClientStatus;
  label: string;
  count: number;
};

export type DashboardAnalytics = {
  kpis: {
    totalClients: number;
    activeLeads: number;
    wonDeals: number;
    lostDeals: number;
    totalConversations: number;
  };
  pipelineStages: PipelineStageAnalytics[];
  recentClients: Client[];
};
