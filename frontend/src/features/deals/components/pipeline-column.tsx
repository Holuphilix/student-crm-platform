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
import { cn } from "@/lib/utils";

type PipelineColumnProps = {
  title: string;
  status: ClientStatus;
  deals: DealWithClient[];
};

const stageIndicatorStyles: Record<ClientStatus, string> = {
  new_lead: "bg-slate-400",
  contacted: "bg-blue-500",
  consultation_booked: "bg-violet-500",
  documents_requested: "bg-orange-500",
  application_started: "bg-yellow-500",
  submitted: "bg-cyan-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

export function PipelineColumn({
  title,
  status,
  deals,
}: PipelineColumnProps) {
  return (
    <Card className="bg-muted/25 shadow-sm">
      <CardHeader className="border-b bg-card py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2.5 rounded-full",
                stageIndicatorStyles[status]
              )}
            />
            {title}
          </CardTitle>

          <Badge variant="secondary" className="rounded-full">
            {deals.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed bg-background/70 px-3 py-3 text-center">
            <p className="text-sm font-medium text-foreground">
              Stage is clear
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deals appear here when moved into this stage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
