import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ClientDeal } from "@/features/clients/types/client.types";

type ClientDealsSectionProps = {
  deals: ClientDeal[];
};

const currencyFormatter = new Intl.NumberFormat(
  undefined,
  {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }
);

const dealDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
  }
);

export function ClientDealsSection({
  deals,
}: ClientDealsSectionProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            Deals
          </CardTitle>

          <Badge variant="secondary">
            {deals.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {deal.title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Created{" "}
                      {dealDateFormatter.format(
                        new Date(deal.created_at)
                      )}
                    </p>
                  </div>

                  <Badge className="capitalize">
                    {deal.stage}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    {deal.value_amount
                      ? currencyFormatter.format(
                          deal.value_amount
                        )
                      : "No value set"}
                  </p>

                  <p className="text-muted-foreground sm:text-right">
                    {deal.expected_intake ||
                      "No intake set"}
                  </p>
                </div>

                {deal.lost_reason ? (
                  <p className="mt-2 text-sm text-destructive">
                    {deal.lost_reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No deals linked to this client.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
