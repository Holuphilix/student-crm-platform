import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useClients } from "@/features/clients/hooks/use-clients";

import { ConversationList } from "@/features/conversations/components/conversation-list";
import { ConversationThread } from "@/features/conversations/components/conversation-thread";
import { MessageInput } from "@/features/conversations/components/message-input";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useUsers } from "@/features/users/hooks/use-users";
import type { Client } from "@/features/clients/types/client.types";
import { getFriendlyDisplayName } from "@/features/auth/utils/user-display";

export function ConversationsPage() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = role === "admin" || role === "manager";
  const isClient = role === "client" || role === "user";
  const isSales = role === "sales";
  const conversationFilter = searchParams.get("filter");

  const [selectedClientId, setSelectedClientId] =
    useState<string | null>(null);
  const [isStartingConversation, setIsStartingConversation] =
    useState(false);

  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError: isClientsError,
  } = useClients();

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    createMessage,
    isCreatingMessage,
    assignConversation,
    isAssigningConversation,
  } = useConversations();

  const { data: users = [] } = useUsers({
    enabled: isAdmin,
  });

  const visibleMessages = useMemo(
    () =>
      conversationFilter === "unassigned"
        ? messages.filter((message) => !message.assigned_to)
        : messages,
    [conversationFilter, messages]
  );

  const conversationClients = useMemo(() => {
    if (!isSales && conversationFilter !== "unassigned") {
      return clients;
    }

    const clientById = new Map<string, Client>();

    for (const message of visibleMessages) {
      const relatedClient = message.clients;

      if (!relatedClient) {
        continue;
      }

      clientById.set(message.client_id, {
        id: message.client_id,
        full_name:
          relatedClient.full_name ?? "Client",
        email: relatedClient.email ?? "",
        phone: null,
        company: relatedClient.company ?? null,
        status:
          (relatedClient.status as Client["status"]) ??
          "new_lead",
        owner_id: relatedClient.owner_id ?? null,
        profile_id: relatedClient.profile_id ?? null,
        created_at: message.created_at,
      });
    }

    for (const client of clients) {
      clientById.set(client.id, client);
    }

    return Array.from(clientById.values());
  }, [clients, conversationFilter, isSales, visibleMessages]);

  const activeClientId =
    selectedClientId ?? conversationClients[0]?.id ?? null;

  const selectedClient = useMemo(
    () =>
      clients.find(
        (client) => client.id === activeClientId
      ) ??
      conversationClients.find(
        (client) => client.id === activeClientId
      ) ??
      null,
    [activeClientId, clients, conversationClients]
  );

  const selectedMessages = useMemo(
    () =>
      visibleMessages.filter(
        (message) =>
          message.client_id === activeClientId
      ),
    [activeClientId, visibleMessages]
  );

  const selectedConversation =
    selectedMessages[selectedMessages.length - 1] ?? null;
  const isSelectedConversationAssignedToSales =
    selectedConversation?.assigned_to === user?.id;
  const isSelectedConversationUnassigned =
    selectedConversation &&
    !selectedConversation.assigned_to;
  const canReply =
    !isSales ||
    Boolean(isSelectedConversationAssignedToSales);
  const salesUsers = users.filter(
    (user) =>
      user.role === "sales" && user.status === "active"
  );

  const isLoading =
    isLoadingClients || isLoadingMessages;

  const hasError =
    isClientsError || isMessagesError;

  async function handleSendMessage(message: string) {
    if (!activeClientId) {
      toast.error("Your client profile is still being prepared.");
      return;
    }

    try {
      await createMessage({
        client_id: activeClientId,
        message,
        sender: isClient ? "client" : "agent",
      });
      setIsStartingConversation(false);
    } catch {
      toast.error("Failed to send message.");
    }
  }

  async function handleAssignConversation(
    assignedTo: string
  ) {
    if (!selectedConversation) {
      toast.error("Select a conversation first.");
      return;
    }

    try {
      await assignConversation({
        conversationId: selectedConversation.id,
        payload: {
          assigned_to: assignedTo || null,
        },
      });
      toast.success("Conversation assignment updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to assign conversation."
      );
    }
  }

  async function handleAssignToMe() {
    if (!user) {
      toast.error("You must be signed in.");
      return;
    }

    await handleAssignConversation(user.id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isClient ? "My Conversations" : "Conversations"}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {isClient
            ? "Message the CRM team and follow your application updates."
            : "Message clients and follow live CRM updates."}
        </p>
      </div>

      {isClient ? (
        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>
                  Conversation Threads
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start a conversation or continue your latest thread with the CRM team.
                </p>
              </div>

              <Button
                type="button"
                onClick={() =>
                  setIsStartingConversation(true)
                }
              >
                Start Conversation
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading conversations...
              </div>
            ) : selectedMessages.length > 0 ||
              isStartingConversation ? (
              <>
                <ConversationThread
                  client={selectedClient}
                  messages={selectedMessages}
                />

                <MessageInput
                  disabled={!activeClientId}
                  isSending={isCreatingMessage}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="font-medium">
                  No conversations yet.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Start a conversation with the CRM team when you are ready to discuss your application.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() =>
                    setIsStartingConversation(true)
                  }
                >
                  Start Conversation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : hasError ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Failed to load conversations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="rounded-lg">
            <CardHeader className="border-b">
              <CardTitle>
                {isSales ? "Conversation Queue" : "Clients"}
              </CardTitle>
            </CardHeader>

            <CardContent className="max-h-[72vh] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading conversations...
                </p>
              ) : (
                <ConversationList
                  clients={conversationClients}
                  messages={visibleMessages}
                  selectedClientId={activeClientId}
                  onSelectClient={setSelectedClientId}
                  emptyLabel={
                    isSales
                      ? "No assigned or unassigned conversations."
                      : "No clients available."
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card className="min-h-[72vh] rounded-lg">
            <CardContent className="flex flex-1 flex-col px-0">
              {isLoading ? (
                <div className="flex min-h-96 items-center justify-center p-6 text-sm text-muted-foreground">
                  Loading messages...
                </div>
              ) : (
                <>
                  <ConversationThread
                    client={selectedClient}
                    messages={selectedMessages}
                  />

                  {isSales && selectedConversation ? (
                    <div className="border-t px-4 py-3">
                      {isSelectedConversationUnassigned ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Unassigned Conversation
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Assign this conversation to yourself before replying.
                            </p>
                          </div>

                          <Button
                            type="button"
                            disabled={
                              isAssigningConversation
                            }
                            onClick={handleAssignToMe}
                          >
                            {isAssigningConversation
                              ? "Assigning..."
                              : "Assign to Me"}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isSelectedConversationAssignedToSales
                            ? "Assigned to you. You can reply to this conversation."
                            : "Assigned to another sales representative."}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {isAdmin && selectedConversation ? (
                    <div className="border-t px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Assigned To
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Select an active sales user.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={
                              selectedConversation.assigned_to ??
                              ""
                            }
                            disabled={isAssigningConversation}
                            className="h-9 min-w-56 rounded-lg border border-input bg-background px-3 text-sm"
                            onChange={(event) =>
                              handleAssignConversation(
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Unassigned
                            </option>
                            {salesUsers.map((user) => (
                              <option
                                key={user.id}
                                value={user.id}
                              >
                                {getFriendlyDisplayName({
                                  full_name: user.full_name,
                                  email: user.email,
                                  fallback: "Sales Representative",
                                })}
                              </option>
                            ))}
                          </select>

                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              isAssigningConversation
                            }
                            onClick={() =>
                              handleAssignConversation("")
                            }
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <MessageInput
                    disabled={!activeClientId || !canReply}
                    isSending={isCreatingMessage}
                    onSendMessage={handleSendMessage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
