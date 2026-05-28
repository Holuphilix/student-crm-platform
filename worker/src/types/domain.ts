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

export type DealStage = ClientStatus;

export type Deal = {
  id: string;
  client_id: string;
  owner_id: string | null;
  title: string;
  stage: DealStage;
  value_amount: number | null;
  expected_intake: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type DealWithClient = Deal & {
  clients?: {
    full_name: string;
    email: string;
    company: string | null;
  } | null;
};

export type CreateDealPayload = {
  client_id: string;
  owner_id?: string;
  title: string;
  value_amount?: number;
  expected_intake?: string;
};

export type UpdateDealStagePayload = {
  stage: DealStage;
  lost_reason?: string;
};

export type DealNote = {
  id: string;
  deal_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type CreateDealNotePayload = {
  deal_id: string;
  author_id: string;
  body: string;
};

export type DealStageHistory = {
  id: string;
  deal_id: string;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by: string | null;
  created_at: string;
};

export type DealActivityType =
  | "deal_created"
  | "note_created"
  | "stage_changed";

export type DealActivityItem = {
  id: string;
  type: DealActivityType;
  title: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type DealDetail = {
  deal: DealWithClient;
  notes: DealNote[];
  stageHistory: DealStageHistory[];
  activityFeed: DealActivityItem[];
};

export type ClientActivityType =
  | "client_created"
  | "conversation_message"
  | "deal_created"
  | "deal_note"
  | "deal_stage_changed";

export type ClientActivityItem = {
  id: string;
  type: ClientActivityType;
  title: string;
  description: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type ClientDetail = {
  client: Client;
  conversations: ConversationMessage[];
  deals: Deal[];
  notes: DealNote[];
  stageHistory: DealStageHistory[];
};
