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
              "flex items-center gap-3 rounded-lg border px-3 py-3",
              isCurrent && "border-primary bg-primary/5",
              isComplete && "border-emerald-200 bg-emerald-50"
            )}
          >
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border",
                isComplete &&
                  "border-emerald-500 bg-emerald-500 text-white",
                isCurrent &&
                  "border-primary bg-primary text-primary-foreground"
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
