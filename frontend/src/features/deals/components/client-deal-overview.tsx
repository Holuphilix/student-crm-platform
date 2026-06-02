import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  FileText,
  FileUp,
  Flag,
  PhoneCall,
  Send,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationProgress } from "@/features/deals/components/application-progress";
import type { DealWithClient } from "@/features/deals/types/deal.types";
import { normalizeStage } from "@/features/deals/utils/stage-format";
import { clientStatuses } from "@/features/clients/types/client.types";
import { cn } from "@/lib/utils";

type ClientDealOverviewProps = {
  deals: DealWithClient[];
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

const nextActionByStage: Record<string, string> = {
  new_lead: "Wait for your consultant to contact you.",
  contacted: "Prepare for your consultation.",
  consultation_booked: "Attend your scheduled consultation.",
  documents_requested: "Upload or send requested documents.",
  application_started: "Review application details with your consultant.",
  submitted: "Wait for the application decision.",
  won: "Review your successful outcome.",
  lost: "Contact the CRM team for next options.",
};

const timelineStageMeta = {
  new_lead: {
    label: "Lead Created",
    icon: Flag,
    color: "bg-slate-500 text-white",
  },
  contacted: {
    label: "Contacted",
    icon: PhoneCall,
    color: "bg-blue-500 text-white",
  },
  consultation_booked: {
    label: "Consultation Booked",
    icon: CalendarClock,
    color: "bg-violet-500 text-white",
  },
  documents_requested: {
    label: "Documents Requested",
    icon: FileText,
    color: "bg-orange-500 text-white",
  },
  application_started: {
    label: "Application Started",
    icon: ClipboardList,
    color: "bg-yellow-500 text-white",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    color: "bg-cyan-500 text-white",
  },
  won: {
    label: "Won",
    icon: Trophy,
    color: "bg-emerald-500 text-white",
  },
  lost: {
    label: "Lost",
    icon: XCircle,
    color: "bg-red-500 text-white",
  },
} as const;

export function ClientDealOverview({
  deals,
}: ClientDealOverviewProps) {
  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <BriefcaseBusiness className="mx-auto size-9 text-muted-foreground" />
          <p className="mt-3 font-medium">
            No active applications yet.
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Your application progress will appear here after your consultant creates an application record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Follow your application progress and the next steps from your education consultant."
      />

      {deals.map((deal) => {
        const stage = normalizeStage(deal.stage);

        return (
          <Card key={deal.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">
                    {deal.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Application progress
                  </p>
                </div>
                <StatusBadge status={stage} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <ApplicationProgress currentStage={stage} />

              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border bg-background/70 p-3">
                  <UserRound className="size-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned consultant</p>
                    <p className="font-medium">
                      {deal.owner_id ? "Education consultant assigned" : "Assignment pending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border bg-background/70 p-3">
                  <CalendarClock className="size-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last update</p>
                    <p className="font-medium">
                      {dateFormatter.format(
                        new Date(deal.updated_at ?? deal.created_at)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-background/70 p-3">
                  <ClipboardList className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Next action</p>
                    <p className="font-medium">{nextActionByStage[stage]}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/deals/${deal.id}`}>
                      View
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-background/70 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Activity Timeline</p>
                    <p className="text-xs text-muted-foreground">
                      Key milestones for this application.
                    </p>
                  </div>
                </div>

                <div className="relative space-y-0">
                  {clientStatuses.map((timelineStage) => {
                    const currentIndex = clientStatuses.indexOf(stage);
                    const stageIndex = clientStatuses.indexOf(timelineStage);
                    const meta = timelineStageMeta[timelineStage];
                    const Icon = meta.icon;
                    const isReached =
                      stage === "lost"
                        ? timelineStage === "lost"
                        : stageIndex <= currentIndex;
                    const isCurrent =
                      timelineStage === stage;
                    const isLast =
                      stageIndex === clientStatuses.length - 1;

                    return (
                      <div
                        key={timelineStage}
                        className="relative flex items-start gap-3 pb-5 last:pb-0"
                      >
                        {!isLast ? (
                          <span
                            className={cn(
                              "absolute left-4 top-9 h-[calc(100%-2rem)] w-px",
                              isReached ? "bg-primary/30" : "bg-border"
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                        <div
                          className={cn(
                            "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card shadow-sm",
                            isReached && meta.color,
                            !isReached && "text-muted-foreground"
                          )}
                        >
                          {isReached ? (
                            <Icon className="size-4" />
                          ) : (
                            <FileUp className="size-4" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "min-w-0 flex-1 rounded-lg border bg-card px-3 py-2.5 shadow-xs",
                            isCurrent && "border-primary/40 bg-primary/5"
                          )}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium">
                              {meta.label}
                            </p>
                            {isCurrent ? (
                              <StatusBadge status={timelineStage} />
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {isReached
                              ? dateFormatter.format(
                                  new Date(
                                    isCurrent
                                      ? deal.updated_at ?? deal.created_at
                                      : deal.created_at
                                  )
                                )
                              : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
