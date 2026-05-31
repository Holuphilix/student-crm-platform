import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";

import {
  isClientRole,
  isSalesRole,
} from "../lib/authorization";
import { HttpError } from "../lib/http-error";
import {
  isMissingColumnError,
  toCurrentStage,
} from "../lib/legacy-stage";
import type { AuthenticatedUser } from "../types/env";
import {
  clientStatuses,
  type Client,
  type ClientStatus,
  type DashboardAnalytics,
  type Deal,
  type PipelineStageAnalytics,
  type UserProfile,
} from "../types/domain";

type DashboardQueryContext = {
  requestId?: string;
  actor?: AuthenticatedUser;
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
    const status = toCurrentStage(client.status);

    countByStatus.set(
      status,
      (countByStatus.get(status) ?? 0) + 1
    );
  });

  return clientStatuses.map((status) => ({
    status,
    label: formatStatusLabel(status),
    count: countByStatus.get(status) ?? 0,
  }));
}

function isActiveDeal(stage: string) {
  const currentStage = toCurrentStage(stage);

  return currentStage !== "won" && currentStage !== "lost";
}

async function safeSelect<T>(
  queryName: string,
  table: string,
  query: PromiseLike<{
    data: T[] | null;
    error: PostgrestError | null;
  }>,
  context: {
    requestId?: string;
    actorId?: string;
  },
  fallback: T[] = []
) {
  const response = await query;

  if (!response.error) {
    return response.data ?? [];
  }

  if (isMissingColumnError(response.error)) {
    return fallback;
  }

  throwDashboardQueryError({
    query: queryName,
    table,
    error: response.error,
    ...context,
  });
}

export async function getDashboardAnalytics(
  supabase: SupabaseClient,
  context: DashboardQueryContext = {}
): Promise<DashboardAnalytics> {
  const actor = context.actor;

  console.log(
    JSON.stringify({
      event: "dashboard_analytics_fetch_started",
      requestId: context.requestId,
      actorId: actor?.id,
      queries: [
        "clients_pipeline_source",
        "conversations_count",
      ],
    })
  );

  let clientsQuery = supabase
    .from("clients")
    .select(
      "id, full_name, email, phone, company, status, created_at"
    )
    .order("created_at", {
      ascending: false,
    });

  if (actor && isSalesRole(actor.role)) {
    clientsQuery = clientsQuery.eq("owner_id", actor.id);
  }

  if (actor && isClientRole(actor.role)) {
    clientsQuery = actor.email
      ? clientsQuery.ilike("email", actor.email)
      : clientsQuery.eq("email", "__missing_email__");
  }

  let conversationsQuery = supabase
    .from("conversations")
    .select("id, assigned_to, status, created_at");

  if (actor && isSalesRole(actor.role)) {
    conversationsQuery = conversationsQuery.or(
      `assigned_to.eq.${actor.id},assigned_to.is.null`
    );
  }

  if (actor && isClientRole(actor.role)) {
    conversationsQuery = conversationsQuery.eq(
      "author_id",
      actor.id
    );
  }

  const [
    clientsResponse,
    conversationsResponse,
    dealsResponse,
    profilesResponse,
    notesResponse,
    historyResponse,
  ] = await Promise.all([
    clientsQuery,
    conversationsQuery,
    supabase
      .from("deals")
      .select("id, owner_id, title, stage, client_id, created_at"),
    supabase
      .from("profiles")
      .select("id, full_name, email, role"),
    supabase
      .from("deal_notes")
      .select("id, deal_id, author_id, body, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
    supabase
      .from("deal_stage_history")
      .select("id, deal_id, changed_by, from_stage, to_stage, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(5),
  ]);

  if (clientsResponse.error) {
    throwDashboardQueryError({
      query: "clients_pipeline_source",
      table: "clients",
      error: clientsResponse.error,
      requestId: context.requestId,
      actorId: actor?.id,
    });
  }

  const diagnosticsContext = {
    requestId: context.requestId,
    actorId: actor?.id,
  };

  const conversations = conversationsResponse.error
    ? isMissingColumnError(conversationsResponse.error)
      ? await safeSelect(
          "conversations_legacy_count",
          "conversations",
          supabase.from("conversations").select("id, created_at"),
          diagnosticsContext
        )
      : throwDashboardQueryError({
          query: "conversations_count",
          table: "conversations",
          error: conversationsResponse.error,
          ...diagnosticsContext,
        })
    : conversationsResponse.data ?? [];

  const deals = dealsResponse.error
    ? isMissingColumnError(dealsResponse.error)
      ? await safeSelect<Deal>(
          "deals_legacy_source",
          "deals",
          supabase
            .from("deals")
            .select("id, title, stage, client_id, created_at"),
          diagnosticsContext
        )
      : throwDashboardQueryError({
          query: "deals_source",
          table: "deals",
          error: dealsResponse.error,
          ...diagnosticsContext,
        })
    : ((dealsResponse.data ?? []) as Deal[]);

  const profiles = profilesResponse.error
    ? []
    : ((profilesResponse.data ?? []) as UserProfile[]);

  const notes = notesResponse.error ? [] : notesResponse.data ?? [];
  const history = historyResponse.error
    ? []
    : historyResponse.data ?? [];

  const clients = (clientsResponse.data ?? []) as Client[];
  const pipelineStages = buildPipelineStages(clients);
  const profileById = new Map(
    profiles.map((profile) => [profile.id, profile])
  );
  const dealById = new Map(
    deals.map((deal) => [deal.id, deal])
  );
  const clientsById = new Map(
    clients.map((client) => [client.id, client])
  );

  const dealsByOwnerCount = new Map<string, number>();

  deals.forEach((deal) => {
    const ownerId = deal.owner_id ?? "unassigned";
    dealsByOwnerCount.set(
      ownerId,
      (dealsByOwnerCount.get(ownerId) ?? 0) + 1
    );
  });

  const dealsByOwner = Array.from(
    dealsByOwnerCount.entries()
  ).map(([ownerId, count]) => {
    const profile =
      ownerId === "unassigned"
        ? null
        : profileById.get(ownerId);

    return {
      ownerId: ownerId === "unassigned" ? null : ownerId,
      ownerName:
        profile?.full_name ??
        profile?.email ??
        "Unassigned",
      count,
    };
  });

  const recentActivity = [
    ...history.map((item) => {
      const deal = dealById.get(item.deal_id);
      const client = deal
        ? clientsById.get(deal.client_id)
        : null;
      const user = item.changed_by
        ? profileById.get(item.changed_by)
        : null;

      return {
        id: `stage-${item.id}`,
        type: "Stage Updated",
        title: `Deal moved to ${toCurrentStage(item.to_stage)}`,
        timestamp: item.created_at,
        user: user?.full_name ?? user?.email ?? null,
        client: client?.full_name ?? null,
        deal: deal?.title ?? null,
        conversation: null,
      };
    }),
    ...notes.map((item) => {
      const deal = dealById.get(item.deal_id);
      const client = deal
        ? clientsById.get(deal.client_id)
        : null;
      const user = item.author_id
        ? profileById.get(item.author_id)
        : null;

      return {
        id: `note-${item.id}`,
        type: "Deal Note",
        title: item.body,
        timestamp: item.created_at,
        user: user?.full_name ?? user?.email ?? null,
        client: client?.full_name ?? null,
        deal: deal?.title ?? null,
        conversation: null,
      };
    }),
  ]
    .sort(
      (first, second) =>
        new Date(second.timestamp).getTime() -
        new Date(first.timestamp).getTime()
    )
    .slice(0, 8);

  const getStageCount = (status: ClientStatus) =>
    pipelineStages.find((stage) => stage.status === status)
      ?.count ?? 0;

  return {
    kpis: {
      totalClients: clients.length,
      activeLeads: getStageCount("new_lead"),
      activeDeals: deals.filter((deal) =>
        isActiveDeal(deal.stage)
      ).length,
      wonDeals: getStageCount("won"),
      lostDeals: getStageCount("lost"),
      totalConversations: conversations.length,
      unassignedConversations: conversations.filter(
        (conversation) =>
          !("assigned_to" in conversation) ||
          !conversation.assigned_to
      ).length,
      totalSalesUsers: profiles.filter(
        (profile) => profile.role === "sales"
      ).length,
    },
    pipelineStages,
    dealsByOwner,
    recentActivity,
    recentClients: clients.slice(0, 5),
  };
}
