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
  activeDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalConversations: number;
  unassignedConversations: number;
  totalSalesUsers: number;
};

export type DealsByOwnerAnalytics = {
  ownerId: string | null;
  ownerName: string;
  count: number;
};

export type RecentActivityItem = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  user?: string | null;
  client?: string | null;
  deal?: string | null;
  conversation?: string | null;
};

export type DashboardAnalytics = {
  kpis: DashboardKpi;
  pipelineStages: PipelineStageAnalytics[];
  dealsByOwner: DealsByOwnerAnalytics[];
  recentActivity: RecentActivityItem[];
  recentClients: Client[];
};
