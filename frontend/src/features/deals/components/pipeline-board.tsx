import { useMemo } from "react";

import {
  clientStatuses,
  type ClientStatus,
} from "@/features/clients/types/client.types";

import { PipelineColumn } from "@/features/deals/components/pipeline-column";
import { useDeals } from "@/features/deals/hooks/use-deals";
import type { DealWithClient } from "@/features/deals/types/deal.types";

type PipelineStatusConfig = {
  status: ClientStatus;
  title: string;
};

const pipelineStatuses: PipelineStatusConfig[] =
  clientStatuses.map((status) => ({
    status,
    title: status
      .split("_")
      .map(
        (word) =>
          `${word.charAt(0).toUpperCase()}${word.slice(1)}`
      )
      .join(" "),
  }));

function groupDealsByStage(deals: DealWithClient[]) {
  return deals.reduce<
    Record<ClientStatus, DealWithClient[]>
  >(
    (groups, deal) => {
      groups[deal.stage].push(deal);

      return groups;
    },
    {
      lead: [],
      qualified: [],
      proposal: [],
      won: [],
      lost: [],
    }
  );
}

export function PipelineBoard() {
  const {
    data: deals = [],
    isLoading,
    isError,
  } = useDeals();

  const dealsByStage = useMemo(
    () => groupDealsByStage(deals),
    [deals]
  );

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading pipeline...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load pipeline.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {pipelineStatuses.map(({ status, title }) => (
        <PipelineColumn
          key={status}
          title={title}
          status={status}
          deals={dealsByStage[status]}
        />
      ))}
    </div>
  );
}
