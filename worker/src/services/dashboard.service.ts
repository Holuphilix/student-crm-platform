import type { SupabaseClient } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import {
  clientStatuses,
  type Client,
  type ClientStatus,
  type DashboardAnalytics,
  type PipelineStageAnalytics,
} from "../types/domain";

function formatStatusLabel(status: ClientStatus) {
  return status
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");
}

function buildPipelineStages(
  clients: Client[]
): PipelineStageAnalytics[] {
  const countByStatus = new Map<ClientStatus, number>(
    clientStatuses.map((status) => [status, 0])
  );

  clients.forEach((client) => {
    countByStatus.set(
      client.status,
      (countByStatus.get(client.status) ?? 0) + 1
    );
  });

  return clientStatuses.map((status) => ({
    status,
    label: formatStatusLabel(status),
    count: countByStatus.get(status) ?? 0,
  }));
}

export async function getDashboardAnalytics(
  supabase: SupabaseClient
): Promise<DashboardAnalytics> {
  const [clientsResponse, conversationsResponse] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("conversations")
        .select("id", {
          count: "exact",
          head: true,
        }),
    ]);

  if (clientsResponse.error) {
    throw new HttpError(
      502,
      "DASHBOARD_CLIENTS_FETCH_FAILED",
      clientsResponse.error.message
    );
  }

  if (conversationsResponse.error) {
    throw new HttpError(
      502,
      "DASHBOARD_CONVERSATIONS_FETCH_FAILED",
      conversationsResponse.error.message
    );
  }

  const clients = (clientsResponse.data ?? []) as Client[];
  const pipelineStages = buildPipelineStages(clients);

  const getStageCount = (status: ClientStatus) =>
    pipelineStages.find((stage) => stage.status === status)
      ?.count ?? 0;

  return {
    kpis: {
      totalClients: clients.length,
      activeLeads: getStageCount("lead"),
      wonDeals: getStageCount("won"),
      lostDeals: getStageCount("lost"),
      totalConversations:
        conversationsResponse.count ?? 0,
    },
    pipelineStages,
    recentClients: clients.slice(0, 5),
  };
}
