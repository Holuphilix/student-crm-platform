import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/features/clients/types/client.types";
import { formatStageLabel } from "@/features/deals/utils/stage-format";

type ApplicationProgressProps = {
  currentStage: ClientStatus;
};

const progressStages: ClientStatus[] = [
  "new_lead",
  "contacted",
  "consultation_booked",
  "documents_requested",
  "application_started",
  "submitted",
  "won",
];

const stageStyles: Record<ClientStatus, string> = {
  new_lead: "border-slate-200 bg-slate-50 text-slate-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  consultation_booked: "border-violet-200 bg-violet-50 text-violet-700",
  documents_requested: "border-orange-200 bg-orange-50 text-orange-700",
  application_started: "border-yellow-200 bg-yellow-50 text-yellow-800",
  submitted: "border-cyan-200 bg-cyan-50 text-cyan-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-red-200 bg-red-50 text-red-700",
};

const stageDotStyles: Record<ClientStatus, string> = {
  new_lead: "border-slate-500 bg-slate-500",
  contacted: "border-blue-500 bg-blue-500",
  consultation_booked: "border-violet-500 bg-violet-500",
  documents_requested: "border-orange-500 bg-orange-500",
  application_started: "border-yellow-500 bg-yellow-500",
  submitted: "border-cyan-500 bg-cyan-500",
  won: "border-emerald-500 bg-emerald-500",
  lost: "border-red-500 bg-red-500",
};

export function ApplicationProgress({
  currentStage,
}: ApplicationProgressProps) {
  const currentIndex = progressStages.indexOf(currentStage);
  const isLost = currentStage === "lost";

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {progressStages.map((stage, index) => {
        const isComplete = !isLost && index < currentIndex;
        const isCurrent = !isLost && index === currentIndex;

        return (
          <div
            key={stage}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-3 shadow-xs",
              stageStyles[stage],
              isCurrent && "ring-2 ring-primary/25",
              isComplete && "border-emerald-200 bg-emerald-50"
            )}
          >
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border",
                isComplete &&
                  "border-emerald-500 bg-emerald-500 text-white",
                isCurrent &&
                  `${stageDotStyles[stage]} text-white`
              )}
            >
              {isComplete ? (
                <Check className="size-4" />
              ) : (
                <Circle className="size-3" />
              )}
            </div>
            <span className="text-sm font-medium">
              {formatStageLabel(stage)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
