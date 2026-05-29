import type { User } from "@supabase/supabase-js";

import type {
  UserProfile,
  UserRole,
} from "@/features/auth/types/auth.types";

export function getUserDisplayName(
  user: User | null,
  profile: UserProfile | null
) {
  if (profile?.full_name) {
    return profile.full_name;
  }

  if (profile?.email) {
    return profile.email;
  }

  return user?.email ?? "User";
}

export function getUserDisplayEmail(
  user: User | null,
  profile: UserProfile | null
) {
  return profile?.email ?? user?.email ?? "";
}

export function getRoleDisplayName(
  role: UserRole | null
) {
  if (role === "admin") {
    return "Administrator";
  }

  if (role === "user") {
    return "User";
  }

  if (role === "sales") {
    return "Sales Representative";
  }

  if (role === "manager") {
    return "Manager";
  }

  return "User";
}
