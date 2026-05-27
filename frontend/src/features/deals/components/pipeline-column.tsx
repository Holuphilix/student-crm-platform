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

import { DealCard } from "@/features/deals/components/deal-card";

type PipelineColumnProps = {
  title: string;
  status: ClientStatus;
  clients: Client[];
};

export function PipelineColumn({
  title,
  status,
  clients,
}: PipelineColumnProps) {
  return (
    <Card className="min-h-80 rounded-lg bg-muted/40 shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">
            {title}
          </CardTitle>

          <Badge variant="secondary">
            {clients.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {clients.length > 0 ? (
          clients.map((client) => (
            <DealCard
              key={client.id}
              client={client}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed bg-background/60 px-3 py-6 text-center text-sm text-muted-foreground">
            No {status} deals
          </p>
        )}
      </CardContent>
    </Card>
  );
}
