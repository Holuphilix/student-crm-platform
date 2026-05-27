import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";

import type { Client } from "@/features/clients/types/client.types";
import type { ConversationMessage } from "@/features/conversations/types/conversation.types";

type ConversationThreadProps = {
  client: Client | null;
  messages: ConversationMessage[];
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
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Select a client to view the conversation.
      </div>
    );
  }

  return (
    <div className="flex min-h-96 flex-1 flex-col">
      <div className="border-b px-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">
              {client.full_name}
            </h2>

            <p className="truncate text-sm text-muted-foreground">
              {client.email}
            </p>
          </div>

          <Badge className="capitalize">
            {client.status}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isAgentMessage =
              message.sender === "agent";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isAgentMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm md:max-w-[70%] ${
                    isAgentMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.message}
                  </p>

                  <p
                    className={`mt-1 text-xs ${
                      isAgentMessage
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.sender} -{" "}
                    {messageTimeFormatter.format(
                      new Date(message.created_at)
                    )}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No messages yet.
          </div>
        )}

        <div ref={endOfThreadRef} />
      </div>
    </div>
  );
}
