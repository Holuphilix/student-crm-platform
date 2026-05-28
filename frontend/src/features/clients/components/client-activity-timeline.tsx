import {
  CircleDot,
  FileText,
  MessageSquare,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ClientActivityItem,
  ClientActivityType,
} from "@/features/clients/types/client.types";

type ClientActivityTimelineProps = {
  activities: ClientActivityItem[];
};

const activityDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

const activityIconByType: Record<
  ClientActivityType,
  typeof CircleDot
> = {
  client_created: UserPlus,
  conversation_message: MessageSquare,
  deal_created: TrendingUp,
  deal_note: FileText,
  deal_stage_changed: CircleDot,
};

export function ClientActivityTimeline({
  activities,
}: ClientActivityTimelineProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 12).map((activity) => {
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
            No activity recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
