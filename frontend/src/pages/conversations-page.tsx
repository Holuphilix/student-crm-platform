import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Inbox,
  MessageSquare,
  Search,
  UserCheck,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredConversationClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversationClients;
    }

    return conversationClients.filter((client) =>
      [client.full_name, client.email, client.company]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [conversationClients, searchQuery]);

  const activeClientId =
    selectedClientId ?? filteredConversationClients[0]?.id ?? null;

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
      <PageHeader
        title={isClient ? "My Conversations" : "Conversations"}
        description={
          isClient
            ? "Message the CRM team and follow your application updates."
            : "Message clients and follow live CRM updates."
        }
      />

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
                  currentUserId={user?.id}
                />

                <MessageInput
                  disabled={!activeClientId}
                  isSending={isCreatingMessage}
                  onSendMessage={handleSendMessage}
                />
              </>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
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
                  <MessageSquare className="mr-2 size-4" />
                  Start Conversation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : hasError ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-sm text-destructive">
              <Inbox className="size-5" />
              Failed to load conversations.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card>
            <CardHeader className="border-b">
              <div className="space-y-3">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-primary" />
                  {isSales ? "Conversation Queue" : "Clients"}
                </CardTitle>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    placeholder="Search conversations..."
                    aria-label="Search conversations"
                    className="pl-9"
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="max-h-[46vh] overflow-y-auto lg:max-h-[72vh]">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading conversations...
                </p>
              ) : (
                <ConversationList
                  clients={filteredConversationClients}
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

          <Card className="lg:min-h-[72vh]">
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
                    currentUserId={user?.id}
                  />

                  {isSales && selectedConversation ? (
                    <div className="border-t px-4 py-3">
                      {isSelectedConversationUnassigned ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-center gap-2 text-sm font-medium">
                              <Inbox className="size-4 text-primary" />
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
                            <UserCheck className="mr-2 size-4" />
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

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                          <select
                            value={
                              selectedConversation.assigned_to ??
                              ""
                            }
                            disabled={isAssigningConversation}
                            className="h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm shadow-xs transition hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-56"
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
