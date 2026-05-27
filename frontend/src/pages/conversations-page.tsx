import { useMemo, useState } from "react";

import { toast } from "sonner";

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

export function ConversationsPage() {
  const [selectedClientId, setSelectedClientId] =
    useState<string | null>(null);

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
  } = useConversations();

  const activeClientId =
    selectedClientId ?? clients[0]?.id ?? null;

  const selectedClient = useMemo(
    () =>
      clients.find(
        (client) => client.id === activeClientId
      ) ?? null,
    [activeClientId, clients]
  );

  const selectedMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.client_id === activeClientId
      ),
    [activeClientId, messages]
  );

  const isLoading =
    isLoadingClients || isLoadingMessages;

  const hasError =
    isClientsError || isMessagesError;

  async function handleSendMessage(message: string) {
    if (!activeClientId) {
      return;
    }

    try {
      await createMessage({
        client_id: activeClientId,
        message,
        sender: "agent",
      });
    } catch {
      toast.error("Failed to send message.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Conversations
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Message clients and follow live CRM updates.
        </p>
      </div>

      {hasError ? (
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
                Clients
              </CardTitle>
            </CardHeader>

            <CardContent className="max-h-[72vh] overflow-y-auto">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading conversations...
                </p>
              ) : (
                <ConversationList
                  clients={clients}
                  messages={messages}
                  selectedClientId={activeClientId}
                  onSelectClient={setSelectedClientId}
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

                  <MessageInput
                    disabled={!activeClientId}
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
