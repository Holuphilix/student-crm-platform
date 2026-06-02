import {
  CircleDot,
  FileText,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  DealActivityItem,
  DealActivityType,
} from "@/features/deals/types/deal.types";

type ActivityFeedProps = {
  activities: DealActivityItem[];
  title?: string;
};

const activityDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

const activityIconByType: Record<
  DealActivityType,
  typeof CircleDot
> = {
  deal_created: TrendingUp,
  note_created: FileText,
  stage_changed: CircleDot,
};

export function ActivityFeed({
  activities,
  title = "Activity Feed",
}: ActivityFeedProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon =
                activityIconByType[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex gap-3"
                >
                  <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {activity.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {activityDateFormatter.format(
                          new Date(activity.created_at)
                        )}
                      </p>
                    </div>

                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No activity recorded for this deal.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
