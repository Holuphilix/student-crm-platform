import { apiClient } from "@/lib/api/client";

import type {
  Client,
  ClientActivityItem,
  ClientDetail,
  ClientDetailApiPayload,
  ClientDetailApiResponse,
  CreateClientPayload,
} from "@/features/clients/types/client.types";

export async function getClients(): Promise<Client[]> {
  return apiClient<Client[]>("/api/clients");
}

export async function createClient(
  payload: CreateClientPayload
): Promise<Client> {
  return apiClient<Client>("/api/clients", {
    method: "POST",

    body: JSON.stringify(payload),
  });
}

export async function getClientDetail(
  clientId: string
): Promise<ClientDetail> {
  const payload = await apiClient<ClientDetailApiPayload>(
    `/api/clients/${clientId}`
  );

  const detail = normalizeClientDetail(payload);

  return {
    ...detail,
    activityTimeline:
      buildClientActivityTimeline(detail),
  };
}

function normalizeClientDetail(
  payload: ClientDetailApiPayload
): ClientDetailApiResponse {
  if ("client" in payload) {
    return payload;
  }

  return {
    client: payload,
    conversations: [],
    deals: [],
    notes: [],
    stageHistory: [],
  };
}

function buildClientActivityTimeline(
  detail: ClientDetailApiResponse
): ClientActivityItem[] {
  const dealTitleById = new Map(
    detail.deals.map((deal) => [
      deal.id,
      deal.title,
    ])
  );

  const timeline: ClientActivityItem[] = [
    {
      id: `client-created-${detail.client.id}`,
      type: "client_created",
      title: "Client created",
      description: `${detail.client.full_name} was added to the CRM.`,
      created_at: detail.client.created_at,
      metadata: {
        client_id: detail.client.id,
      },
    },
    ...detail.conversations.map((message) => ({
      id: `conversation-${message.id}`,
      type: "conversation_message" as const,
      title: "Conversation message",
      description: message.message,
      created_at: message.created_at,
      metadata: {
        message_id: message.id,
        sender: message.sender,
      },
    })),
    ...detail.deals.map((deal) => ({
      id: `deal-created-${deal.id}`,
      type: "deal_created" as const,
      title: "Deal created",
      description: deal.title,
      created_at: deal.created_at,
      metadata: {
        deal_id: deal.id,
        stage: deal.stage,
      },
    })),
    ...detail.notes.map((note) => ({
      id: `deal-note-${note.id}`,
      type: "deal_note" as const,
      title: "Deal note added",
      description: note.body,
      created_at: note.created_at,
      metadata: {
        deal_id: note.deal_id,
        deal_title:
          dealTitleById.get(note.deal_id) ?? "Deal",
      },
    })),
    ...detail.stageHistory.map((history) => ({
      id: `deal-stage-${history.id}`,
      type: "deal_stage_changed" as const,
      title: "Deal stage changed",
      description: `${dealTitleById.get(history.deal_id) ?? "Deal"} moved from ${history.from_stage ?? "none"} to ${history.to_stage}.`,
      created_at: history.created_at,
      metadata: {
        deal_id: history.deal_id,
        from_stage: history.from_stage,
        to_stage: history.to_stage,
      },
    })),
  ];

  return timeline.sort(
    (firstItem, secondItem) =>
      new Date(secondItem.created_at).getTime() -
      new Date(firstItem.created_at).getTime()
  );
}
