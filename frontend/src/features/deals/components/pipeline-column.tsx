import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ClientStatus,
} from "@/features/clients/types/client.types";

import { DealCard } from "@/features/deals/components/deal-card";
import type { DealWithClient } from "@/features/deals/types/deal.types";

type PipelineColumnProps = {
  title: string;
  status: ClientStatus;
  deals: DealWithClient[];
};

export function PipelineColumn({
  title,
  deals,
}: PipelineColumnProps) {
  return (
    <Card className="min-h-80 rounded-lg bg-muted/40 shadow-none">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">
            {title}
          </CardTitle>

          <Badge variant="secondary">
            {deals.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed bg-background/60 px-3 py-6 text-center text-sm text-muted-foreground">
            No active deals at this stage.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
