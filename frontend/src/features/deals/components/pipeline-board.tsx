import { useMemo } from "react";

import {
  clientStatuses,
  type Client,
  type ClientStatus,
} from "@/features/clients/types/client.types";

import { useClients } from "@/features/clients/hooks/use-clients";

import { PipelineColumn } from "@/features/deals/components/pipeline-column";

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

function groupClientsByStatus(clients: Client[]) {
  return clients.reduce<
    Record<ClientStatus, Client[]>
  >(
    (groups, client) => {
      groups[client.status].push(client);

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
    data: clients = [],
    isLoading,
    isError,
  } = useClients();

  const clientsByStatus = useMemo(
    () => groupClientsByStatus(clients),
    [clients]
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
          clients={clientsByStatus[status]}
        />
      ))}
    </div>
  );
}
