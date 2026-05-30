import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";

import { HttpError } from "../lib/http-error";
import {
  clientStatuses,
  type Client,
  type ClientStatus,
  type DashboardAnalytics,
  type PipelineStageAnalytics,
} from "../types/domain";

type DashboardQueryContext = {
  requestId?: string;
  actorId?: string;
};

type DashboardQueryFailure = {
  query: string;
  table: string;
  error: PostgrestError;
  requestId?: string;
  actorId?: string;
};

function logDashboardQueryFailure(
  failure: DashboardQueryFailure
) {
  console.error(
    JSON.stringify({
      event: "dashboard_query_failed",
      requestId: failure.requestId,
      actorId: failure.actorId,
      query: failure.query,
      table: failure.table,
      supabase: {
        code: failure.error.code,
        message: failure.error.message,
        details: failure.error.details,
        hint: failure.error.hint,
      },
    })
  );
}

function throwDashboardQueryError(
  failure: DashboardQueryFailure
): never {
  logDashboardQueryFailure(failure);

  throw new HttpError(
    502,
    "DASHBOARD_QUERY_FAILED",
    `Dashboard ${failure.query} query failed.`,
    {
      query: failure.query,
      table: failure.table,
      supabase: {
        code: failure.error.code,
        message: failure.error.message,
        details: failure.error.details,
        hint: failure.error.hint,
      },
      requestId: failure.requestId,
    }
  );
}

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
  supabase: SupabaseClient,
  context: DashboardQueryContext = {}
): Promise<DashboardAnalytics> {
  console.log(
    JSON.stringify({
      event: "dashboard_analytics_fetch_started",
      requestId: context.requestId,
      actorId: context.actorId,
      queries: [
        "clients_pipeline_source",
        "conversations_count",
      ],
    })
  );

  const [clientsResponse, conversationsResponse] =
    await Promise.all([
      supabase
        .from("clients")
        .select(
          "id, full_name, email, phone, company, status, created_at"
        )
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
    throwDashboardQueryError({
      query: "clients_pipeline_source",
      table: "clients",
      error: clientsResponse.error,
      ...context,
    });
  }

  if (conversationsResponse.error) {
    throwDashboardQueryError({
      query: "conversations_count",
      table: "conversations",
      error: conversationsResponse.error,
      ...context,
    });
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
