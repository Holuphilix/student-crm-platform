import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useClients } from "@/features/clients/hooks/use-clients";
import { useConversations } from "@/features/conversations/hooks/use-conversations";
import { useDeals } from "@/features/deals/hooks/use-deals";
import { normalizeStage } from "@/features/deals/utils/stage-format";
import { ApplicationProgress } from "@/features/deals/components/application-progress";
import { StatusBadge } from "@/components/common/status-badge";

export function ClientDashboard() {
  const {
    data: clients = [],
    isLoading: isLoadingClient,
  } = useClients();
  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
  } = useConversations();
  const {
    data: deals = [],
    isLoading: isLoadingDeals,
  } = useDeals();

  const client = clients[0] ?? null;
  const completedProfileFields = [
    client?.full_name,
    client?.phone,
    client?.country,
    client?.target_country,
  ].filter(Boolean).length;
  const profileCompletionLabel = client
    ? `${completedProfileFields}/4 complete`
    : "Profile pending";
  const activeDeal =
    deals.find(
      (deal) =>
        normalizeStage(deal.stage) !== "won" &&
        normalizeStage(deal.stage) !== "lost"
    ) ?? deals[0];

  const isLoading =
    isLoadingClient ||
    isLoadingConversations ||
    isLoadingDeals;

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading your workspace...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/profile" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profileCompletionLabel}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {completedProfileFields === 4
                ? "Your profile is complete."
                : "Add full name, phone, country, and target country."}
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/conversations" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {conversations.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages with the CRM team
            </p>
          </CardContent>
        </Card>
        </Link>

        <Link to="/deals?filter=active" className="block rounded-lg">
        <Card className="rounded-lg cursor-pointer transition hover:bg-muted/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Active Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDeal ? (
              <>
                <p className="truncate text-lg font-semibold">
                  {activeDeal.title}
                </p>
                <StatusBadge
                  status={normalizeStage(activeDeal.stage)}
                  className="mt-2"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active deal yet.
              </p>
            )}
          </CardContent>
        </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/conversations">
                Message the Team
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>
              Latest Deal Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDeal ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {activeDeal.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stage:{" "}
                  {normalizeStage(activeDeal.stage).replaceAll(
                    "_",
                    " "
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expected intake:{" "}
                  {activeDeal.expected_intake ??
                    "Not set"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your application deal will appear here when the team creates it.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {activeDeal ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationProgress
              currentStage={normalizeStage(activeDeal.stage)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
