import type { Session, User } from "@supabase/supabase-js";

export const userRoles = [
  "admin",
  "sales",
  "manager",
] as const;

export type UserRole = (typeof userRoles)[number];

export type UserProfile = {
  id: string;
  role: UserRole;
  created_at: string;
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
}
