import type {
  Client,
  ClientStatus,
} from "@/features/clients/types/client.types";

export type DashboardAnalyticsSource = {
  clients: Client[];
  totalConversations: number;
};

export type PipelineStageAnalytics = {
  status: ClientStatus;
  label: string;
  count: number;
  fill: string;
};

export type DashboardKpi = {
  totalClients: number;
  activeLeads: number;
  wonDeals: number;
  lostDeals: number;
  totalConversations: number;
};

export type DashboardAnalytics = {
  kpis: DashboardKpi;
  pipelineStages: PipelineStageAnalytics[];
  recentClients: Client[];
};
