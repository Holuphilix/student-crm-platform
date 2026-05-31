import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { RecentActivityItem } from "@/features/dashboard/types/dashboard.types";

type RecentActivityTimelineProps = {
  activities: RecentActivityItem[];
  isLoading?: boolean;
};

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function RecentActivityTimeline({
  activities,
  isLoading = false,
}: RecentActivityTimelineProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No recent activity available.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline">
                    {activity.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatter.format(
                      new Date(activity.timestamp)
                    )}
                  </p>
                </div>

                <p className="mt-2 text-sm font-medium">
                  {activity.title}
                </p>

                <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <span>User: {activity.user ?? "System"}</span>
                  <span>Client: {activity.client ?? "N/A"}</span>
                  <span>Deal: {activity.deal ?? "N/A"}</span>
                  <span>
                    Conversation:{" "}
                    {activity.conversation ?? "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
