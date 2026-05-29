import type { Session, User } from "@supabase/supabase-js";

export const userRoles = [
  "user",
  "admin",
  "sales",
  "manager",
] as const;

export type UserRole = (typeof userRoles)[number];

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
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

export type SignUpResult = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
};

export type PasswordRecoveryPayload = {
  email: string;
};

export type UpdatePasswordPayload = {
  password: string;
};

export type UpdateEmailPayload = {
  email: string;
};

export type UpdateProfilePayload = {
  fullName: string;
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
  updateProfile: (
    payload: UpdateProfilePayload
  ) => Promise<void>;
}
