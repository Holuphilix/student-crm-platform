export const clientStatuses = [
  "new_lead",
  "contacted",
  "consultation_booked",
  "documents_requested",
  "application_started",
  "submitted",
  "won",
  "lost",
] as const;

export type ClientStatus =
  (typeof clientStatuses)[number];

export type Client = {
  id: string;
  profile_id?: string | null;
  owner_id?: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country?: string | null;
  target_country?: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at?: string | null;
};

export type CreateClientPayload = {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  target_country?: string;
  status: ClientStatus;
};

export type UpdateClientPayload = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  country?: string | null;
  target_country?: string | null;
};

export type DealStage = ClientStatus;

export type ClientConversationMessage = {
  id: string;
  client_id: string;
  author_id?: string | null;
  message: string;
  sender: "client" | "agent";
  created_at: string;
};

export type ClientDeal = {
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

export type ClientDealNote = {
  id: string;
  deal_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type ClientDealStageHistory = {
  id: string;
  deal_id: string;
  from_stage: DealStage | null;
  to_stage: DealStage;
  changed_by: string | null;
  created_at: string;
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
  conversations: ClientConversationMessage[];
  deals: ClientDeal[];
  notes: ClientDealNote[];
  stageHistory: ClientDealStageHistory[];
  activityTimeline: ClientActivityItem[];
};

export type ClientDetailApiResponse = {
  client: Client;
  conversations: ClientConversationMessage[];
  deals: ClientDeal[];
  notes: ClientDealNote[];
  stageHistory: ClientDealStageHistory[];
};

export type ClientDetailApiPayload =
  | Client
  | ClientDetailApiResponse;
