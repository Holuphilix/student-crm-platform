import { Dot, Inbox, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/common/avatar-initials";
import { StatusBadge } from "@/components/common/status-badge";

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
      <div className="rounded-lg border border-dashed bg-background/70 p-8 text-center text-sm text-muted-foreground">
        <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="font-medium text-foreground">
          No conversations found
        </p>
        <p className="mt-1">{emptyLabel}</p>
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
        const hasUnreadSignal =
          latestMessage?.sender === "client" &&
          (latestMessage.status === "open" ||
            latestMessage.status === "pending" ||
            !latestMessage.status);

        return (
          <Button
            key={client.id}
            type="button"
            variant={isSelected ? "secondary" : "ghost"}
            className={`h-auto w-full justify-start rounded-lg px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md ${
              hasUnreadSignal
                ? "border border-blue-200 bg-blue-50/70"
                : ""
            }`}
            onClick={() => onSelectClient(client.id)}
          >
            <div className="relative mr-3 shrink-0">
              <AvatarInitials
                name={client.full_name}
                email={client.email}
              />
              {hasUnreadSignal ? (
                <span
                  className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-blue-600 ring-2 ring-card"
                  aria-label="Unread client reply"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">
                  {client.full_name}
                </span>

                <div className="flex shrink-0 items-center gap-1.5">
                  {hasUnreadSignal ? (
                    <Badge className="rounded-full bg-blue-600 text-[10px] text-white">
                      New
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className="rounded-full"
                  >
                    {clientMessages.length}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="size-3.5 shrink-0" />
                <p className="truncate">
                  {latestMessage?.message ||
                    client.company ||
                    client.email}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <StatusBadge
                  status={latestMessage?.status ?? "open"}
                  className="text-[10px]"
                />
                {latestMessage ? (
                  <span className="flex items-center text-[10px] text-muted-foreground">
                    <Dot className="size-4 text-primary" />
                    {new Date(latestMessage.created_at).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
