import {
  BriefcaseBusiness,
  CheckCircle2,
  Inbox,
  MessageSquare,
} from "lucide-react";
import type { ComponentType } from "react";
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
import { cn } from "@/lib/utils";

type SalesMetricCardProps = {
  title: string;
  value: number;
  to: string;
  icon: ComponentType<{ className?: string }>;
  accent: "blue" | "orange" | "purple" | "green";
};

const stageIndicatorStyles: Record<string, string> = {
  new_lead: "bg-slate-400",
  contacted: "bg-blue-500",
  consultation_booked: "bg-violet-500",
  documents_requested: "bg-orange-500",
  application_started: "bg-yellow-500",
  submitted: "bg-cyan-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

const metricAccentStyles: Record<
  SalesMetricCardProps["accent"],
  {
    card: string;
    icon: string;
  }
> = {
  blue: {
    card: "border-t-4 border-t-blue-500",
    icon: "bg-blue-50 text-blue-600",
  },
  orange: {
    card: "border-t-4 border-t-orange-500",
    icon: "bg-orange-50 text-orange-600",
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

function SalesMetricCard({
  title,
  value,
  to,
  icon: Icon,
  accent,
}: SalesMetricCardProps) {
  const styles = metricAccentStyles[accent];

  return (
    <Link to={to} className="block rounded-lg">
      <Card
        className={cn(
          "h-full cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
          styles.card
        )}
      >
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              styles.icon
            )}
          >
            <Icon className="size-5" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {value}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

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
        <SalesMetricCard
          title="My Assigned Conversations"
          value={assignedConversations.length}
          to="/conversations"
          icon={MessageSquare}
          accent="blue"
        />
        <SalesMetricCard
          title="Unassigned Conversations"
          value={unassignedConversations.length}
          to="/conversations?filter=unassigned"
          icon={Inbox}
          accent="orange"
        />
        <SalesMetricCard
          title="My Active Deals"
          value={activeDeals.length}
          to="/deals?filter=active"
          icon={BriefcaseBusiness}
          accent="purple"
        />
        <SalesMetricCard
          title="Won Deals"
          value={wonDeals.length}
          to="/deals?stage=won"
          icon={CheckCircle2}
          accent="green"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BriefcaseBusiness className="size-5 text-primary" />
            Pipeline Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stageCounts.map(({ stage, count }) => (
              <Link
                key={stage}
                to={`/deals?stage=${stage}`}
                className="flex items-center justify-between rounded-lg border bg-background/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted/60 hover:shadow-md"
              >
                  <span className="text-sm font-medium">
                    <span
                      className={cn(
                        "mr-2 inline-block size-2 rounded-full",
                        stageIndicatorStyles[stage]
                      )}
                    />
                    {formatStageLabel(stage)}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                    {count}
                  </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
