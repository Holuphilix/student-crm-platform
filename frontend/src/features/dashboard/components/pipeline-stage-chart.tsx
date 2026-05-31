import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

import type { PipelineStageAnalytics } from "@/features/dashboard/types/dashboard.types";

type PipelineStageChartProps = {
  data: PipelineStageAnalytics[];
  isLoading?: boolean;
};

export function PipelineStageChart({
  data,
  isLoading = false,
}: PipelineStageChartProps) {
  const hasData = data.some((stage) => stage.count > 0);
  const chartDataKey = data
    .map((stage) => `${stage.status}:${stage.count}`)
    .join("|");

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          Pipeline Stages
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : hasData ? (
          <div className="h-72">
            <ResponsiveContainer
              key={chartDataKey}
              width="100%"
              height="100%"
            >
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  left: 40,
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
                  dataKey="label"
                  width={150}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                >
                  {data.map((stage) => (
                    <Cell
                      key={stage.status}
                      fill={stage.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {data.map((stage) => (
                <Link
                  key={stage.status}
                  to={`/deals?stage=${stage.status}`}
                  className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {stage.label}: {stage.count}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No pipeline data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
