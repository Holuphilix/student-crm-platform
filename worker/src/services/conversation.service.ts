import type { SupabaseClient } from "@supabase/supabase-js";

import {
  assertCanAccessClient,
  isAdminManagerRole,
  isClientRole,
  isSalesRole,
  requireAdminManager,
} from "../lib/authorization";
import { HttpError } from "../lib/http-error";
import { isMissingColumnError } from "../lib/legacy-stage";
import type { AuthenticatedUser } from "../types/env";
import type {
  AssignConversationPayload,
  Client,
  ConversationMessage,
  CreateConversationMessagePayload,
  UpdateConversationStatusPayload,
} from "../types/domain";

function isLegacyConversationSchemaError(error: {
  code?: string;
  message?: string;
}) {
  return (
    isMissingColumnError(error) ||
    error.code === "PGRST200" ||
    error.message
      ?.toLowerCase()
      .includes("could not find a relationship") === true
  );
}

async function fetchLegacyConversations(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new HttpError(
      502,
      "CONVERSATIONS_FETCH_FAILED",
      error.message
    );
  }

  const conversations =
    (data ?? []) as ConversationMessage[];

  if (
    isAdminManagerRole(actor.role) ||
    isSalesRole(actor.role)
  ) {
    return conversations;
  }

  if (!actor.email) {
    return [];
  }

  const { data: clients, error: clientsError } =
    await supabase
      .from("clients")
      .select("id, profile_id, email");

  if (clientsError) {
    if (isMissingColumnError(clientsError)) {
      const legacyClientsResponse = await supabase
        .from("clients")
        .select("id, email");

      if (legacyClientsResponse.error) {
        throw new HttpError(
          502,
          "CLIENTS_FETCH_FAILED",
          legacyClientsResponse.error.message
        );
      }

      const legacyClientIds = new Set(
        ((legacyClientsResponse.data ?? []) as Pick<
          Client,
          "id" | "email"
        >[])
          .filter(
            (client) =>
              client.email.toLowerCase() ===
              actor.email?.toLowerCase()
          )
          .map((client) => client.id)
      );

      return conversations.filter((conversation) =>
        legacyClientIds.has(conversation.client_id)
      );
    }

    throw new HttpError(
      502,
      "CLIENTS_FETCH_FAILED",
      clientsError.message
    );
  }

  const accessibleClientIds = new Set(
    ((clients ?? []) as Pick<
      Client,
      "id" | "profile_id" | "email"
    >[])
      .filter(
        (client) =>
          client.profile_id === actor.id ||
          client.email.toLowerCase() ===
            actor.email?.toLowerCase()
      )
      .map((client) => client.id)
  );

  return conversations.filter((conversation) =>
    accessibleClientIds.has(conversation.client_id)
  );
}

export async function getConversations(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<ConversationMessage[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      clients (
        profile_id,
        owner_id,
        full_name,
        email,
        company,
        status
      )
    `
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    if (isLegacyConversationSchemaError(error)) {
      return fetchLegacyConversations(supabase, actor);
    }

    throw new HttpError(
      502,
      "CONVERSATIONS_FETCH_FAILED",
      error.message
    );
  }

  const conversations =
    (data ?? []) as (ConversationMessage & {
      clients?:
        | Pick<
            Client,
            | "profile_id"
            | "owner_id"
            | "full_name"
            | "email"
            | "company"
            | "status"
          >
        | null;
    })[];

  if (isAdminManagerRole(actor.role)) {
    return conversations;
  }

  return conversations.filter((conversation) => {
    if (isSalesRole(actor.role)) {
      return (
        conversation.assigned_to === actor.id ||
        conversation.assigned_to === null ||
        conversation.assigned_to === undefined
      );
    }

    return Boolean(
      conversation.clients?.profile_id === actor.id ||
        (actor.email &&
          conversation.clients?.email?.toLowerCase() ===
            actor.email.toLowerCase())
    );
  });
}

export async function createConversationMessage(
  supabase: SupabaseClient,
  payload: CreateConversationMessagePayload,
  actor: AuthenticatedUser
): Promise<ConversationMessage> {
  const { data: client, error: clientError } =
    await supabase
      .from("clients")
      .select("*")
      .eq("id", payload.client_id)
      .single<Client>();

  if (clientError || !client) {
    throw new HttpError(
      404,
      "CLIENT_NOT_FOUND",
      "Client not found."
    );
  }

  if (isClientRole(actor.role)) {
    assertCanAccessClient(actor, client);
  }

  if (isSalesRole(actor.role)) {
    const {
      data: assignedConversation,
      error: assignedConversationError,
    } =
      await supabase
        .from("conversations")
        .select("id")
        .eq("client_id", payload.client_id)
        .eq("assigned_to", actor.id)
        .limit(1)
        .maybeSingle();

    if (
      assignedConversationError &&
      !isLegacyConversationSchemaError(
        assignedConversationError
      )
    ) {
      throw new HttpError(
        502,
        "CONVERSATION_ASSIGNMENT_CHECK_FAILED",
        assignedConversationError.message
      );
    }

    if (
      !assignedConversation &&
      !assignedConversationError
    ) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Sales users can reply only to assigned conversations."
      );
    }
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      ...payload,
      author_id: actor.id,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    if (isLegacyConversationSchemaError(error)) {
      const { data: legacyData, error: legacyError } =
        await supabase
          .from("conversations")
          .insert(payload)
          .select()
          .single();

      if (!legacyError) {
        return legacyData as ConversationMessage;
      }
    }

    throw new HttpError(
      502,
      "CONVERSATION_CREATE_FAILED",
      error.message
    );
  }

  return data as ConversationMessage;
}

export async function getConversationDetail(
  supabase: SupabaseClient,
  conversationId: string,
  actor: AuthenticatedUser
): Promise<ConversationMessage[]> {
  const { data: conversation, error: conversationError } =
    await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single<ConversationMessage>();

  if (conversationError || !conversation) {
    throw new HttpError(
      404,
      "CONVERSATION_NOT_FOUND",
      "Conversation not found."
    );
  }

  const conversations = await getConversations(
    supabase,
    actor
  );

  return conversations.filter(
    (message) =>
      message.client_id === conversation.client_id
  );
}

export async function replyToConversation(
  supabase: SupabaseClient,
  conversationId: string,
  payload: {
    message: string;
    sender: "client" | "agent";
  },
  actor: AuthenticatedUser
): Promise<ConversationMessage> {
  const { data: conversation, error: conversationError } =
    await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single<ConversationMessage>();

  if (conversationError || !conversation) {
    throw new HttpError(
      404,
      "CONVERSATION_NOT_FOUND",
      "Conversation not found."
    );
  }

  return createConversationMessage(
    supabase,
    {
      client_id: conversation.client_id,
      message: payload.message,
      sender: payload.sender,
    },
    actor
  );
}

export async function assignConversation(
  supabase: SupabaseClient,
  conversationId: string,
  payload: AssignConversationPayload,
  actor: AuthenticatedUser
): Promise<ConversationMessage[]> {
  const { data: conversation, error: conversationError } =
    await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single<ConversationMessage>();

  if (conversationError || !conversation) {
    throw new HttpError(
      404,
      "CONVERSATION_NOT_FOUND",
      "Conversation not found."
    );
  }

  if (isSalesRole(actor.role)) {
    if (
      conversation.assigned_to &&
      conversation.assigned_to !== actor.id
    ) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "This conversation is already assigned to another user."
      );
    }

    if (payload.assigned_to !== actor.id) {
      throw new HttpError(
        403,
        "FORBIDDEN",
        "Sales users can only assign conversations to themselves."
      );
    }
  } else {
    requireAdminManager(actor);
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({
      assigned_to: payload.assigned_to,
      status: "open",
    })
    .eq("client_id", conversation.client_id)
    .select();

  if (error) {
    if (isLegacyConversationSchemaError(error)) {
      throw new HttpError(
        409,
        "CONVERSATION_ASSIGNMENT_SCHEMA_REQUIRED",
        "Conversation assignment requires assigned_to and status columns on the conversations table."
      );
    }

    throw new HttpError(
      502,
      "CONVERSATION_ASSIGN_FAILED",
      error.message
    );
  }

  if (payload.assigned_to) {
    const ownerUpdate = await supabase
      .from("clients")
      .update({
        owner_id: payload.assigned_to,
      })
      .eq("id", conversation.client_id)
      .is("owner_id", null);

    if (
      ownerUpdate.error &&
      !isMissingColumnError(ownerUpdate.error)
    ) {
      throw new HttpError(
        502,
        "CLIENT_OWNER_SYNC_FAILED",
        ownerUpdate.error.message
      );
    }
  }

  return (data ?? []) as ConversationMessage[];
}

export async function updateConversationStatus(
  supabase: SupabaseClient,
  conversationId: string,
  payload: UpdateConversationStatusPayload,
  actor: AuthenticatedUser
): Promise<ConversationMessage[]> {
  const { data: conversation, error: conversationError } =
    await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single<ConversationMessage>();

  if (conversationError || !conversation) {
    throw new HttpError(
      404,
      "CONVERSATION_NOT_FOUND",
      "Conversation not found."
    );
  }

  if (
    !isAdminManagerRole(actor.role) &&
    conversation.assigned_to !== actor.id
  ) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "You can update only assigned conversations."
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({
      status: payload.status,
    })
    .eq("client_id", conversation.client_id)
    .select();

  if (error) {
    if (isLegacyConversationSchemaError(error)) {
      throw new HttpError(
        409,
        "CONVERSATION_STATUS_SCHEMA_REQUIRED",
        "Conversation status updates require the status column on the conversations table."
      );
    }

    throw new HttpError(
      502,
      "CONVERSATION_STATUS_UPDATE_FAILED",
      error.message
    );
  }

  return (data ?? []) as ConversationMessage[];
}
