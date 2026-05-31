import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { clientStatuses } from "@/features/clients/types/client.types";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useDeals } from "@/features/deals/hooks/use-deals";
import { formatStageLabel, normalizeStage } from "@/features/deals/utils/stage-format";

export function SalesDashboard() {
  const { user } = useAuth();
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
  } = useConversations();
  const {
    data: deals = [],
    isLoading: isLoadingDeals,
  } = useDeals();

  const assignedConversations = conversations.filter(
    (conversation) => conversation.assigned_to === user?.id
  );
  const unassignedConversations = conversations.filter(
    (conversation) => !conversation.assigned_to
  );
  const activeDeals = deals.filter((deal) => {
    const stage = normalizeStage(deal.stage);
    return stage !== "won" && stage !== "lost";
  });
  const wonDeals = deals.filter(
    (deal) => normalizeStage(deal.stage) === "won"
  );

  const isLoading =
    isLoadingConversations || isLoadingDeals;

  const stageCounts = clientStatuses.map((stage) => ({
    stage,
    count: deals.filter(
      (deal) => normalizeStage(deal.stage) === stage
    ).length,
  }));

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading your sales workspace...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/conversations" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              My Assigned Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {assignedConversations.length}
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/conversations?filter=unassigned" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Unassigned Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {unassignedConversations.length}
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/deals?filter=active" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              My Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {activeDeals.length}
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/deals?stage=won" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Won Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {wonDeals.length}
            </p>
          </CardContent>
        </Card>
        </Link>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            Pipeline Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stageCounts.map(({ stage, count }) => (
              <div
                key={stage}
                className="flex items-center justify-between rounded-lg border p-3 transition hover:bg-muted/40"
              >
                <Link
                  to={`/deals?stage=${stage}`}
                  className="flex w-full items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {formatStageLabel(stage)}
                  </span>
                  <Badge variant="secondary">{count}</Badge>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
