import { BriefcaseBusiness, CalendarClock, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationProgress } from "@/features/deals/components/application-progress";
import type { DealWithClient } from "@/features/deals/types/deal.types";
import { normalizeStage } from "@/features/deals/utils/stage-format";

type ClientDealOverviewProps = {
  deals: DealWithClient[];
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

export function ClientDealOverview({
  deals,
}: ClientDealOverviewProps) {
  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BriefcaseBusiness className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 font-medium">
            No active applications yet.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Your application progress will appear here after your consultant creates an application record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Follow your application progress and the next steps from your education consultant."
      />

      {deals.map((deal) => {
        const stage = normalizeStage(deal.stage);

        return (
          <Card key={deal.id} className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">
                    {deal.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Application progress
                  </p>
                </div>
                <StatusBadge status={stage} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ApplicationProgress currentStage={stage} />

              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <UserRound className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned consultant</p>
                    <p className="font-medium">
                      {deal.owner_id ? "Education consultant assigned" : "Assignment pending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border p-3">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last update</p>
                    <p className="font-medium">
                      {dateFormatter.format(
                        new Date(deal.updated_at ?? deal.created_at)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Next action</p>
                    <p className="font-medium">Review your latest update</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/deals/${deal.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
