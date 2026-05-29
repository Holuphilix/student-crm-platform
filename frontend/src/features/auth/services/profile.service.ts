import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/supabase-client";

import type {
  UpdateProfilePayload,
  UserProfile,
  UserRole,
} from "@/features/auth/types/auth.types";

function getMetadataFullName(user: User) {
  const fullName = user.user_metadata?.full_name;

  return typeof fullName === "string"
    ? fullName
    : "";
}

async function getProfileWithFullName(userId: string) {
  return supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", userId)
    .maybeSingle();
}

async function getProfileWithoutFullName(userId: string) {
  return supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("id", userId)
    .maybeSingle();
}

export async function getUserProfile(
  user: User
): Promise<UserProfile | null> {
  const profileWithFullName =
    await getProfileWithFullName(user.id);

  if (!profileWithFullName.error) {
    if (!profileWithFullName.data) {
      return null;
    }

    return {
      ...profileWithFullName.data,
      full_name: profileWithFullName.data.full_name ?? null,
      email:
        profileWithFullName.data.email ??
        user.email ??
        null,
    } as UserProfile;
  }

  const fallbackProfile =
    await getProfileWithoutFullName(user.id);

  if (fallbackProfile.error) {
    throw new Error(fallbackProfile.error.message);
  }

  if (!fallbackProfile.data) {
    return null;
  }

  return {
    ...fallbackProfile.data,
    full_name: null,
    email: user.email ?? null,
  } as UserProfile;
}

function isMissingColumnError(
  error: { message: string } | null,
  columnName: string
) {
  return (
    error?.message
      .toLowerCase()
      .includes(columnName) &&
    error.message.toLowerCase().includes("column")
  );
}

export async function ensureUserProfile(payload: {
  user: User;
  fullName?: string;
  email?: string;
  role?: UserRole;
}) {
  const fullName =
    payload.fullName?.trim() ||
    getMetadataFullName(payload.user) ||
    null;
  const email =
    payload.email ?? payload.user.email ?? null;
  const role = payload.role ?? "user";

  const profilePayload = {
    id: payload.user.id,
    full_name: fullName,
    email,
    role,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(profilePayload, {
      onConflict: "id",
    });

  if (!error) {
    return getUserProfile(payload.user);
  }

  if (
    isMissingColumnError(error, "email") ||
    isMissingColumnError(error, "full_name")
  ) {
    const { error: fallbackError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: payload.user.id,
          role,
        },
        {
          onConflict: "id",
        }
      );

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    return getUserProfile(payload.user);
  }

  throw new Error(error.message);
}

export async function updateAuthenticatedProfile(
  user: User,
  payload: UpdateProfilePayload
) {
  const fullName = payload.fullName.trim();

  const { error: authError } =
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    });

  if (authError) {
    throw new Error(authError.message);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    throw new Error(profileError.message);
  }
}
