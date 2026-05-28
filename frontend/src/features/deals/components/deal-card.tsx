import type { ComponentProps } from "react";
import { Link } from "react-router-dom";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ClientStatus,
} from "@/features/clients/types/client.types";
import { useUpdateDealStage } from "@/features/deals/hooks/use-deals";
import type {
  DealStage,
  DealWithClient,
} from "@/features/deals/types/deal.types";

type DealCardProps = {
  deal: DealWithClient;
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

const dealStages: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
];

const currencyFormatter = new Intl.NumberFormat(
  undefined,
  {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }
);

export function DealCard({ deal }: DealCardProps) {
  const updateStageMutation = useUpdateDealStage();

  async function handleStageChange(stage: DealStage) {
    try {
      await updateStageMutation.mutateAsync({
        dealId: deal.id,
        payload: {
          stage,
        },
      });
    } catch {
      toast.error("Failed to update deal stage.");
    }
  }

  return (
    <Card
      size="sm"
      className="rounded-lg bg-background shadow-none"
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 truncate">
            {deal.title}
          </CardTitle>

          <Badge
            variant={statusBadgeVariant[deal.stage]}
            className="capitalize"
          >
            {deal.stage}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 text-sm">
        <p className="truncate text-muted-foreground">
          {deal.clients?.full_name ?? "No client linked"}
        </p>

        <p className="truncate font-medium">
          {deal.clients?.company || "No company"}
        </p>

        <p className="text-muted-foreground">
          {deal.value_amount
            ? currencyFormatter.format(deal.value_amount)
            : "No value set"}
        </p>

        <div className="pt-2">
          <select
            value={deal.stage}
            disabled={updateStageMutation.isPending}
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
            onChange={(event) =>
              handleStageChange(
                event.target.value as DealStage
              )
            }
          >
            {dealStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to={`/deals/${deal.id}`}>
              Open workspace
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
