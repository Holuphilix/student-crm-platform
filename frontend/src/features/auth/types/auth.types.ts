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

export type SignInPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  fullName: string;
  email: string;
  password: string;
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (payload: SignInPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
}
