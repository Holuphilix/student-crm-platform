import type { ComponentType } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type AnalyticsCardProps = {
  title: string;
  value: number;
  icon: ComponentType<{
    className?: string;
  }>;
  isLoading?: boolean;
};

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  isLoading = false,
}: AnalyticsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>

        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-semibold">
            {value.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
