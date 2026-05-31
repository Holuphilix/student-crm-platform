import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { SalesTeamStat } from "@/features/users/types/user.types";
import { getFriendlyDisplayName } from "@/features/auth/utils/user-display";

type SalesTeamCardProps = {
  stats: SalesTeamStat[];
  isLoading: boolean;
};

export function SalesTeamCard({
  stats,
  isLoading,
}: SalesTeamCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Sales Team Management</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading sales users...
          </p>
        ) : stats.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active sales users found.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((member) => (
              <div
                key={member.id}
                className="rounded-lg border p-4"
              >
                <p className="font-medium">
                  {getFriendlyDisplayName({
                    full_name: member.full_name,
                    email: member.email,
                    fallback: "Sales Representative",
                  })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Conversations:{" "}
                  {member.conversationsCount}
                </p>
                <p className="text-sm text-muted-foreground">
                  Deals: {member.dealsCount}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
