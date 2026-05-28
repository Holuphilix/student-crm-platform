import type { ClientStatus } from "@/features/clients/types/client.types";

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

export type DealNote = {
  id: string;
  deal_id: string;
  author_id: string;
  body: string;
  created_at: string;
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

export type CreateDealNotePayload = {
  body: string;
};

export type CreateDealPayload = {
  client_id: string;
  title: string;
  value_amount?: number;
  expected_intake?: string;
};

export type UpdateDealStagePayload = {
  stage: DealStage;
  lost_reason?: string;
};
