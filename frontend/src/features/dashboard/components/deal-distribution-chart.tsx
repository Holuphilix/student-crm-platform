import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { PipelineStageAnalytics } from "@/features/dashboard/types/dashboard.types";

type DealDistributionChartProps = {
  data: PipelineStageAnalytics[];
  isLoading?: boolean;
};

export function DealDistributionChart({
  data,
  isLoading = false,
}: DealDistributionChartProps) {
  const hasData = data.some((stage) => stage.count > 0);
  const chartDataKey = data
    .map((stage) => `${stage.status}:${stage.count}`)
    .join("|");

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          Deal Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : hasData ? (
          <div className="space-y-3">
            <div className="h-60">
              <ResponsiveContainer
                key={chartDataKey}
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Tooltip />

                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    isAnimationActive={false}
                  >
                    {data.map((stage) => (
                      <Cell
                        key={stage.status}
                        fill={stage.fill}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              {data.map((stage) => (
                <div
                  key={stage.status}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: stage.fill,
                    }}
                  />
                  <span className="truncate text-muted-foreground">
                    {stage.label}: {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No deal data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
