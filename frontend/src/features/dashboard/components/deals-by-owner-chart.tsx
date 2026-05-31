import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { DealsByOwnerAnalytics } from "@/features/dashboard/types/dashboard.types";

type DealsByOwnerChartProps = {
  data: DealsByOwnerAnalytics[];
  isLoading?: boolean;
};

export function DealsByOwnerChart({
  data,
  isLoading = false,
}: DealsByOwnerChartProps) {
  const hasData = data.some((owner) => owner.count > 0);

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Deals By Owner</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : hasData ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  left: 24,
                  right: 16,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="ownerName"
                  width={140}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid gap-2 text-xs">
              {data.map((owner) => (
                <Link
                  key={owner.ownerId ?? "unassigned"}
                  to={
                    owner.ownerId
                      ? `/deals?ownerId=${owner.ownerId}`
                      : "/deals?owner=unassigned"
                  }
                  className="flex items-center justify-between rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <span>{owner.ownerName}</span>
                  <span>{owner.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No owner data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
