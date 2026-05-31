import type { UserRole } from "@/features/auth/types/auth.types";

export type CrmUserStatus = "active" | "inactive";

export type CrmUser = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  status: CrmUserStatus;
  created_at?: string | null;
  last_sign_in_at?: string | null;
};

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRolePayload = {
  role: UserRole;
};

export type UpdateUserStatusPayload = {
  status: CrmUserStatus;
};

export type SalesTeamStat = {
  id: string;
  full_name: string | null;
  email: string | null;
  conversationsCount: number;
  dealsCount: number;
};
