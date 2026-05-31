import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { Client } from "@/features/clients/types/client.types";
import type { ConversationMessage } from "@/features/conversations/types/conversation.types";

type ConversationListProps = {
  clients: Client[];
  messages: ConversationMessage[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  emptyLabel?: string;
};

function getClientMessages(
  messages: ConversationMessage[],
  clientId: string
) {
  return messages.filter(
    (message) => message.client_id === clientId
  );
}

export function ConversationList({
  clients,
  messages,
  selectedClientId,
  onSelectClient,
  emptyLabel = "No clients available.",
}: ConversationListProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => {
        const clientMessages = getClientMessages(
          messages,
          client.id
        );

        const latestMessage =
          clientMessages[clientMessages.length - 1];

        const isSelected =
          selectedClientId === client.id;

        return (
          <Button
            key={client.id}
            type="button"
            variant={isSelected ? "secondary" : "ghost"}
            className="h-auto w-full justify-start px-3 py-3 text-left"
            onClick={() => onSelectClient(client.id)}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">
                  {client.full_name}
                </span>

                <Badge variant="outline">
                  {clientMessages.length}
                </Badge>
              </div>

              <p className="truncate text-xs text-muted-foreground">
                {latestMessage?.message ||
                  client.company ||
                  client.email}
              </p>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
