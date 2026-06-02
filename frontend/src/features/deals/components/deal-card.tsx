import { Link } from "react-router-dom";
import {
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  UserRound,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { clientStatuses } from "@/features/clients/types/client.types";
import { useUpdateDealStage } from "@/features/deals/hooks/use-deals";
import type {
  DealStage,
  DealWithClient,
} from "@/features/deals/types/deal.types";
import {
  formatStageLabel,
  normalizeStage,
} from "@/features/deals/utils/stage-format";

type DealCardProps = {
  deal: DealWithClient;
};

const dealStages: DealStage[] = [...clientStatuses];

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
  const normalizedStage = normalizeStage(deal.stage);
  const updatedAt = deal.updated_at ?? deal.created_at;

  async function handleStageChange(stage: DealStage) {
    try {
      await updateStageMutation.mutateAsync({
        dealId: deal.id,
        payload: {
          stage,
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update deal stage."
      );
    }
  }

  return (
    <Card
      size="sm"
      className="bg-background shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 truncate">
            {deal.title}
          </CardTitle>

          <StatusBadge status={normalizedStage} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center gap-2 truncate text-muted-foreground">
          <UserRound className="size-4 shrink-0" />
          {deal.clients?.full_name ?? "No client linked"}
        </p>
        <p className="flex items-center gap-2 truncate text-muted-foreground">
          <BriefcaseBusiness className="size-4 shrink-0" />
          {deal.clients?.company || "No company provided"}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Banknote className="size-4 shrink-0" />
          {deal.value_amount
            ? currencyFormatter.format(deal.value_amount)
            : "Value not set"}
        </p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="size-4 shrink-0" />
          Updated {new Date(updatedAt).toLocaleDateString()}
        </p>

        <div className="pt-2">
          <select
            value={normalizedStage}
            disabled={updateStageMutation.isPending}
            className="h-9 w-full rounded-lg border border-input bg-card px-2 text-sm shadow-xs transition hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            onChange={(event) =>
              handleStageChange(
                event.target.value as DealStage
              )
            }
          >
            {dealStages.map((stage) => (
              <option key={stage} value={stage}>
                {formatStageLabel(stage)}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full"
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
