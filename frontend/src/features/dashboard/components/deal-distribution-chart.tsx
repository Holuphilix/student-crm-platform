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
          <div className="h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Tooltip />

                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
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
        ) : (
          <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            No deal data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
