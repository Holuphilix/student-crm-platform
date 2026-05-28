import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ClientConversationMessage } from "@/features/clients/types/client.types";

type ClientConversationsSectionProps = {
  conversations: ClientConversationMessage[];
};

const messageDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

export function ClientConversationsSection({
  conversations,
}: ClientConversationsSectionProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            Conversations
          </CardTitle>

          <Badge variant="secondary">
            {conversations.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.slice(0, 6).map((message) => (
              <div
                key={message.id}
                className="rounded-lg border p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge
                    variant="outline"
                    className="capitalize"
                  >
                    {message.sender}
                  </Badge>

                  <p className="text-xs text-muted-foreground">
                    {messageDateFormatter.format(
                      new Date(message.created_at)
                    )}
                  </p>
                </div>

                <p className="line-clamp-3 text-sm">
                  {message.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No conversations for this client.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
