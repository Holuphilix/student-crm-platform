import { useEffect, useRef } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import { AvatarInitials } from "@/components/common/avatar-initials";
import { StatusBadge } from "@/components/common/status-badge";

import type { Client } from "@/features/clients/types/client.types";
import type { ConversationMessage } from "@/features/conversations/types/conversation.types";

type ConversationThreadProps = {
  client: Client | null;
  messages: ConversationMessage[];
  currentUserId?: string | null;
};

const messageTimeFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

export function ConversationThread({
  client,
  messages,
}: ConversationThreadProps) {
  const endOfThreadRef = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    endOfThreadRef.current?.scrollIntoView({
      block: "end",
    });
  }, [messages.length, client?.id]);

  if (!client) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed bg-background/70 p-8 text-center text-sm text-muted-foreground">
        <div>
          <MessageSquare className="mx-auto mb-3 size-9" />
          <p className="font-medium text-foreground">
            Select a conversation
          </p>
          <p className="mt-1">
            Choose a client thread to view the message history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-96 flex-1 flex-col">
      <div className="border-b bg-card px-5 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AvatarInitials
              name={client.full_name}
              email={client.email}
              className="size-10"
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {client.full_name}
              </h2>

              <p className="truncate text-sm text-muted-foreground">
                {client.email}
              </p>
            </div>
          </div>

          <StatusBadge status={client.status} />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto bg-muted/30 px-3 py-5 sm:px-5">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isClientMessage =
              message.sender === "client";
            const roleLabel =
              message.sender === "agent"
                ? "CRM Team"
                : "Client";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 sm:gap-3 ${
                  isClientMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {!isClientMessage ? (
                  <AvatarInitials
                    name={roleLabel}
                    className="size-8 bg-primary/10 text-primary"
                  />
                ) : null}
                <div
                  className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-md md:max-w-[68%] ${
                    isClientMessage
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold opacity-90">
                    {!isClientMessage ? (
                      <Sparkles className="size-3.5" />
                    ) : null}
                    {roleLabel}
                  </div>
                  <p className="whitespace-pre-wrap break-words">
                    {message.message}
                  </p>

                  <p
                    className={`mt-2 text-[11px] ${
                      isClientMessage
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {messageTimeFormatter.format(
                      new Date(message.created_at)
                    )}
                  </p>
                </div>
                {isClientMessage ? (
                  <AvatarInitials
                    name={client.full_name}
                    email={client.email}
                    className="size-8 bg-primary text-primary-foreground"
                  />
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed bg-background/70 p-8 text-center text-sm text-muted-foreground">
            <div>
              <MessageSquare className="mx-auto mb-3 size-8" />
              <p className="font-medium text-foreground">
                No messages yet
              </p>
              <p className="mt-1">
                Send the first message to begin this CRM conversation.
              </p>
            </div>
          </div>
        )}

        <div ref={endOfThreadRef} />
      </div>
    </div>
  );
}
