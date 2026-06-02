import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardCheck,
  MessageSquare,
  UserRound,
} from "lucide-react";

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

type ClientMetricCardProps = {
  title: string;
  value: string;
  description: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  accent: "blue" | "purple" | "green";
};

const clientMetricAccentStyles: Record<
  ClientMetricCardProps["accent"],
  {
    card: string;
    icon: string;
  }
> = {
  blue: {
    card: "border-t-4 border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  purple: {
    card: "border-t-4 border-t-violet-500",
    icon: "bg-violet-50 text-violet-600",
  },
  green: {
    card: "border-t-4 border-t-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
  },
};

function ClientMetricCard({
  title,
  value,
  description,
  to,
  icon: Icon,
  accent,
}: ClientMetricCardProps) {
  const styles = clientMetricAccentStyles[accent];

  return (
    <Link to={to} className="block rounded-lg">
      <Card
        className={`h-full cursor-pointer hover:-translate-y-0.5 hover:shadow-lg ${styles.card}`}
      >
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`flex size-10 items-center justify-center rounded-lg ${styles.icon}`}>
            <Icon className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

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
        <ClientMetricCard
          title="Profile Status"
          value={profileCompletionLabel}
          description={
            completedProfileFields === 4
              ? "Your profile is complete."
              : "Add full name, phone, country, and target country."
          }
          to="/profile"
          icon={UserRound}
          accent="green"
        />

        <ClientMetricCard
          title="Conversations"
          value={conversations.length.toString()}
          description="Messages with the CRM team"
          to="/conversations"
          icon={MessageSquare}
          accent="blue"
        />

        <Link to="/deals?filter=active" className="block rounded-lg">
          <Card className="h-full cursor-pointer border-t-4 border-t-violet-500 hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle className="text-sm text-muted-foreground">
                Active Deal
              </CardTitle>
              <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <BriefcaseBusiness className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              {activeDeal ? (
                <div className="space-y-2">
                  <p className="truncate text-lg font-bold">
                    {activeDeal.title}
                  </p>
                  <StatusBadge
                    status={normalizeStage(activeDeal.stage)}
                  />
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="size-3.5" />
                    Intake:{" "}
                    {activeDeal.expected_intake ?? "Not set"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your active application will appear here when the CRM team creates it.
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-primary" />
              Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/conversations">
                <MessageSquare className="mr-2 size-4" />
                Message the Team
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">
                <UserRound className="mr-2 size-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="size-5 text-primary" />
              Latest Deal Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeDeal ? (
              <div className="space-y-3">
                <p className="text-lg font-bold">
                  {activeDeal.title}
                </p>
                <StatusBadge status={normalizeStage(activeDeal.stage)} />
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" />
                  Expected intake:{" "}
                  {activeDeal.expected_intake ??
                    "Not set"}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/deals/${activeDeal.id}`}>
                    View application
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
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
        <Card>
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
