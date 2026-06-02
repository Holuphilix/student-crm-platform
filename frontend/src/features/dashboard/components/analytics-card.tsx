import type { ComponentType } from "react";
import { Link } from "react-router-dom";

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
  to?: string;
};

const analyticsAccentStyles: Record<
  string,
  {
    card: string;
    icon: string;
  }
> = {
  "Assigned Conversations": {
    card: "border-t-4 border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  "My Assigned Conversations": {
    card: "border-t-4 border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  "Total Conversations": {
    card: "border-t-4 border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  "Unassigned Conversations": {
    card: "border-t-4 border-t-orange-500",
    icon: "bg-orange-50 text-orange-600",
  },
  "Active Deals": {
    card: "border-t-4 border-t-violet-500",
    icon: "bg-violet-50 text-violet-600",
  },
  "My Active Deals": {
    card: "border-t-4 border-t-violet-500",
    icon: "bg-violet-50 text-violet-600",
  },
  "Won Deals": {
    card: "border-t-4 border-t-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
  },
};

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  isLoading = false,
  to,
}: AnalyticsCardProps) {
  const accent = analyticsAccentStyles[title] ?? {
    card: "border-t-4 border-t-primary/60",
    icon: "bg-primary/10 text-primary",
  };

  const card = (
    <Card
      className={
        to && !isLoading
          ? `h-full cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${accent.card}`
          : `h-full ${accent.card}`
      }
    >
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {title}
        </CardTitle>

        <div className={`flex size-10 items-center justify-center rounded-lg ${accent.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">
            {value.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!to || isLoading) {
    return card;
  }

  return (
    <Link
      to={to}
      className="block rounded-lg transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {card}
    </Link>
  );
}
