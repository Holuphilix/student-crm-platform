import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  Client,
  ClientStatus,
} from "@/features/clients/types/client.types";

type DealCardProps = {
  client: Client;
};

const statusBadgeVariant: Record<
  ClientStatus,
  ComponentProps<typeof Badge>["variant"]
> = {
  lead: "secondary",
  qualified: "outline",
  proposal: "default",
  won: "default",
  lost: "destructive",
};

export function DealCard({ client }: DealCardProps) {
  return (
    <Card
      size="sm"
      className="rounded-lg bg-background shadow-none"
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 truncate">
            {client.full_name}
          </CardTitle>

          <Badge
            variant={statusBadgeVariant[client.status]}
            className="capitalize"
          >
            {client.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 text-sm">
        <p className="truncate text-muted-foreground">
          {client.email}
        </p>

        <p className="truncate font-medium">
          {client.company || "No company"}
        </p>
      </CardContent>
    </Card>
  );
}
