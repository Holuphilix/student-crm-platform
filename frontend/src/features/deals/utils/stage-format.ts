import type { ClientStatus } from "@/features/clients/types/client.types";
import type { DealStage } from "@/features/deals/types/deal.types";

const currentStageByLegacyStage: Record<string, ClientStatus> = {
  lead: "new_lead",
  qualified: "contacted",
  proposal: "application_started",
};

export function normalizeStage(stage: string): ClientStatus {
  return currentStageByLegacyStage[stage] ?? (stage as ClientStatus);
}

export function formatStageLabel(stage: DealStage | string) {
  return normalizeStage(stage)
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");
}
