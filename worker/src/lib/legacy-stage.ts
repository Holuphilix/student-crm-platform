import type { ClientStatus } from "../types/domain";

const legacyStageByCurrentStage: Partial<
  Record<ClientStatus, string>
> = {
  new_lead: "lead",
  contacted: "qualified",
  consultation_booked: "proposal",
  documents_requested: "proposal",
  application_started: "proposal",
  submitted: "proposal",
};

const currentStageByLegacyStage: Record<string, ClientStatus> = {
  lead: "new_lead",
  qualified: "contacted",
  proposal: "application_started",
};

export function toLegacyStage(stage: ClientStatus) {
  return legacyStageByCurrentStage[stage] ?? stage;
}

export function toCurrentStage(stage: string): ClientStatus {
  return currentStageByLegacyStage[stage] ?? (stage as ClientStatus);
}

export function isMissingColumnError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42703" ||
    error.message?.toLowerCase().includes("column") === true
  );
}

export function isCheckConstraintError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "23514" ||
    error.message
      ?.toLowerCase()
      .includes("violates check constraint") === true
  );
}

export function isEnumValueError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "22P02" &&
    error.message
      ?.toLowerCase()
      .includes("invalid input value for enum") === true
  );
}

export function isStageCompatibilityError(error: {
  code?: string;
  message?: string;
}) {
  return (
    isCheckConstraintError(error) ||
    isEnumValueError(error)
  );
}
