import { HttpError } from "./http-error";
import type {
  AuthenticatedUser,
} from "../types/env";
import type {
  Client,
  DealWithClient,
  UserRole,
} from "../types/domain";

export function isAdminManagerRole(
  role: UserRole | null | undefined
) {
  return role === "admin" || role === "manager";
}

export function isSalesRole(
  role: UserRole | null | undefined
) {
  return role === "sales";
}

export function isClientRole(
  role: UserRole | null | undefined
) {
  return role === "client" || role === "user";
}

export function requireAdminManager(
  actor: AuthenticatedUser
) {
  if (!isAdminManagerRole(actor.role)) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "This action requires manager access."
    );
  }
}

export function requireSalesOrAdminManager(
  actor: AuthenticatedUser
) {
  if (
    !isAdminManagerRole(actor.role) &&
    !isSalesRole(actor.role)
  ) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "This action requires sales or manager access."
    );
  }
}

export function canAccessClient(
  actor: AuthenticatedUser,
  client: Pick<Client, "owner_id" | "email"> & {
    profile_id?: string | null;
  }
) {
  if (isAdminManagerRole(actor.role)) {
    return true;
  }

  if (isSalesRole(actor.role)) {
    return client.owner_id === actor.id;
  }

  return Boolean(
    client.profile_id === actor.id ||
      (actor.email &&
        client.email.toLowerCase() ===
          actor.email.toLowerCase())
  );
}

export function assertCanAccessClient(
  actor: AuthenticatedUser,
  client: Pick<Client, "owner_id" | "email">
) {
  if (!canAccessClient(actor, client)) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "You are not authorized to access this client."
    );
  }
}

export function canAccessDeal(
  actor: AuthenticatedUser,
  deal: Pick<DealWithClient, "owner_id" | "clients">
) {
  if (isAdminManagerRole(actor.role)) {
    return true;
  }

  if (isSalesRole(actor.role)) {
    return deal.owner_id === actor.id;
  }

  const clientEmail = deal.clients?.email;

  return Boolean(
    deal.clients?.profile_id === actor.id ||
      (actor.email &&
        clientEmail &&
        clientEmail.toLowerCase() ===
          actor.email.toLowerCase())
  );
}

export function assertCanAccessDeal(
  actor: AuthenticatedUser,
  deal: Pick<DealWithClient, "owner_id" | "clients">
) {
  if (!canAccessDeal(actor, deal)) {
    throw new HttpError(
      403,
      "FORBIDDEN",
      "You are not authorized to access this deal."
    );
  }
}

export function assertCanMutateDeal(
  actor: AuthenticatedUser,
  deal: Pick<DealWithClient, "owner_id" | "clients">
) {
  if (isAdminManagerRole(actor.role)) {
    return;
  }

  if (isSalesRole(actor.role) && deal.owner_id === actor.id) {
    return;
  }

  throw new HttpError(
    403,
    "FORBIDDEN",
    "You can only modify deals you own."
  );
}
