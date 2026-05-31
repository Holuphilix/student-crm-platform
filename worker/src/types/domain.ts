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

export const userRoles = [
  "client",
  "user",
  "admin",
  "sales",
  "manager",
] as const;

export type UserRole = (typeof userRoles)[number];

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  created_at?: string | null;
};

export type CrmUser = UserProfile & {
  status: "active" | "inactive";
  last_sign_in_at?: string | null;
};

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRolePayload = {
  role: UserRole;
};

export type UpdateUserStatusPayload = {
  status: "active" | "inactive";
};

export type SalesTeamStat = {
  id: string;
  full_name: string | null;
  email: string | null;
  conversationsCount: number;
  dealsCount: number;
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
  status?: ConversationStatus | null;
  message: string;
  sender: ConversationSender;
  created_at: string;
};

export const conversationStatuses = [
  "open",
  "pending",
  "closed",
] as const;

export type ConversationStatus =
  (typeof conversationStatuses)[number];

export type CreateConversationMessagePayload = {
  client_id: string;
  message: string;
  sender: ConversationSender;
};

export type AssignConversationPayload = {
  assigned_to: string | null;
};

export type UpdateConversationStatusPayload = {
  status: ConversationStatus;
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
    activeDeals: number;
    wonDeals: number;
    lostDeals: number;
    totalConversations: number;
    unassignedConversations: number;
    totalSalesUsers: number;
  };
  pipelineStages: PipelineStageAnalytics[];
  dealsByOwner: {
    ownerId: string | null;
    ownerName: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    timestamp: string;
    user?: string | null;
    client?: string | null;
    deal?: string | null;
    conversation?: string | null;
  }[];
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
    profile_id?: string | null;
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

export type UpdateDealOwnerPayload = {
  owner_id: string | null;
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
