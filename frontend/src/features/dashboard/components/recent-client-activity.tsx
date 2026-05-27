import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { Client } from "@/features/clients/types/client.types";

type RecentClientActivityProps = {
  clients: Client[];
  isLoading?: boolean;
};

const activityDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

export function RecentClientActivity({
  clients,
  isLoading = false,
}: RecentClientActivityProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          Recent Client Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-full"
              />
            ))}
          </div>
        ) : clients.length > 0 ? (
          <div className="divide-y">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_160px_180px]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {client.full_name}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {client.company || "No company"}
                  </p>
                </div>

                <div>
                  <Badge className="capitalize">
                    {client.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground md:text-right">
                  {activityDateFormatter.format(
                    new Date(client.created_at)
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No recent clients found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
