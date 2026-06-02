import { useMemo } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  clientStatuses,
  type ClientStatus,
} from "@/features/clients/types/client.types";

import { PipelineColumn } from "@/features/deals/components/pipeline-column";
import { useDeals } from "@/features/deals/hooks/use-deals";
import type { DealWithClient } from "@/features/deals/types/deal.types";
import { normalizeStage } from "@/features/deals/utils/stage-format";

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
      groups[normalizeStage(deal.stage)].push(deal);

      return groups;
    },
    {
      new_lead: [],
      contacted: [],
      consultation_booked: [],
      documents_requested: [],
      application_started: [],
      submitted: [],
      won: [],
      lost: [],
    }
  );
}

export function PipelineBoard() {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const isClient = role === "client" || role === "user";
  const stageFilter = searchParams.get("stage");
  const viewFilter = searchParams.get("filter");
  const ownerIdFilter = searchParams.get("ownerId");
  const ownerFilter = searchParams.get("owner");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: deals = [],
    isLoading,
    isError,
  } = useDeals();

  const filteredDeals = useMemo(
    () =>
      deals.filter((deal) => {
        const normalizedStage = normalizeStage(deal.stage);

        if (stageFilter && normalizedStage !== stageFilter) {
          return false;
        }

        if (
          viewFilter === "active" &&
          (normalizedStage === "won" ||
            normalizedStage === "lost")
        ) {
          return false;
        }

        if (ownerIdFilter && deal.owner_id !== ownerIdFilter) {
          return false;
        }

        if (ownerFilter === "unassigned" && deal.owner_id) {
          return false;
        }

        const query = searchQuery.trim().toLowerCase();

        return (
          !query ||
          [deal.title, deal.clients?.full_name, deal.clients?.company]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query))
        );
      }),
    [deals, ownerFilter, ownerIdFilter, searchQuery, stageFilter, viewFilter]
  );

  const dealsByStage = useMemo(
    () => groupDealsByStage(filteredDeals),
    [filteredDeals]
  );

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading pipeline...
      </p>
    );
  }

  if (isError) {
    if (isClient) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">
              No deals are available yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your application status will appear here when the CRM team creates a deal for you.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <p className="text-sm text-destructive">
        Failed to load pipeline.
      </p>
    );
  }

  if (isClient && filteredDeals.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="font-medium">
            No deals yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your application status will appear here when the CRM team creates a deal for you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={searchQuery}
        placeholder="Search deals by title, client, or company..."
        aria-label="Search deals"
        className="max-w-md"
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {pipelineStatuses
        .filter(
          ({ status }) => !stageFilter || status === stageFilter
        )
        .map(({ status, title }) => (
        <PipelineColumn
          key={status}
          title={title}
          status={status}
          deals={dealsByStage[status]}
        />
        ))}
      </div>
    </div>
  );
}
