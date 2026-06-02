import { AvatarInitials } from "@/components/common/avatar-initials";
import { StatusBadge } from "@/components/common/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Client } from "@/features/clients/types/client.types";

type ClientProfileCardProps = {
  client: Client;
};

const dateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
  }
);

export function ClientProfileCard({
  client,
}: ClientProfileCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <AvatarInitials
              name={client.full_name}
              email={client.email}
            />
            <div className="min-w-0">
            <CardTitle className="truncate text-xl">
              {client.full_name}
            </CardTitle>

            <p className="mt-1 truncate text-sm text-muted-foreground">
              {client.email}
            </p>
            </div>
          </div>

          <StatusBadge status={client.status} />
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Phone
          </p>
          <p className="mt-1 text-sm">
            {client.phone || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Company
          </p>
          <p className="mt-1 text-sm">
            {client.company || "No company"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Country
          </p>
          <p className="mt-1 text-sm">
            {client.country || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Target Country
          </p>
          <p className="mt-1 text-sm">
            {client.target_country || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Created
          </p>
          <p className="mt-1 text-sm">
            {dateFormatter.format(
              new Date(client.created_at)
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
