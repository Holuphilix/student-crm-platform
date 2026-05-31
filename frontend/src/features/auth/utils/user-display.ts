import type { User } from "@supabase/supabase-js";

import type {
  UserProfile,
  UserRole,
} from "@/features/auth/types/auth.types";

function normalizeDisplayValue(value?: string | null) {
  const normalized = value?.trim();

  return normalized && normalized.length > 0
    ? normalized
    : null;
}

function getMetadataName(user: User | null) {
  const metadata = user?.user_metadata;
  const candidates = [
    metadata?.full_name,
    metadata?.name,
    metadata?.display_name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const normalized = normalizeDisplayValue(candidate);

      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

export function getFriendlyDisplayName(payload: {
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  fallback?: string;
}) {
  return (
    normalizeDisplayValue(payload.full_name) ??
    normalizeDisplayValue(payload.name) ??
    normalizeDisplayValue(payload.fallback) ??
    normalizeDisplayValue(payload.email) ??
    "User"
  );
}

export function getUserDisplayName(
  user: User | null,
  profile: UserProfile | null
) {
  return getFriendlyDisplayName({
    full_name: profile?.full_name,
    name: getMetadataName(user),
    email: profile?.email ?? user?.email,
    fallback: "User",
  });
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
    return "Administrator / Manager";
  }

  if (role === "client" || role === "user") {
    return "Client";
  }

  if (role === "sales") {
    return "Sales Representative";
  }

  if (role === "manager") {
    return "Administrator / Manager";
  }

  return "User";
}
