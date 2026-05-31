import { apiClient } from "@/lib/api/client";

import type {
  CreateUserPayload,
  CrmUser,
  SalesTeamStat,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from "@/features/users/types/user.types";

export async function getUsers(): Promise<CrmUser[]> {
  return apiClient<CrmUser[]>("/api/users");
}

export async function createUser(
  payload: CreateUserPayload
): Promise<CrmUser> {
  return apiClient<CrmUser>("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUserRole(
  userId: string,
  payload: UpdateUserRolePayload
): Promise<CrmUser> {
  return apiClient<CrmUser>(
    `/api/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateUserStatus(
  userId: string,
  payload: UpdateUserStatusPayload
): Promise<CrmUser> {
  return apiClient<CrmUser>(
    `/api/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function getSalesTeamStats(): Promise<
  SalesTeamStat[]
> {
  return apiClient<SalesTeamStat[]>(
    "/api/users/sales-stats"
  );
}
