import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdminManager } from "../lib/authorization";
import { HttpError } from "../lib/http-error";
import { isMissingColumnError } from "../lib/legacy-stage";
import type { AuthenticatedUser } from "../types/env";
import type {
  CreateUserPayload,
  CrmUser,
  SalesTeamStat,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserProfile,
} from "../types/domain";

function normalizeRole(role: string | null | undefined) {
  if (role === "client") {
    return "user";
  }

  if (
    role === "admin" ||
    role === "sales" ||
    role === "manager" ||
    role === "user"
  ) {
    return role;
  }

  return "user";
}

async function listAuthUsers(supabase: SupabaseClient) {
  const users = [];
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } =
      await supabase.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new HttpError(
        502,
        "AUTH_USERS_FETCH_FAILED",
        error.message
      );
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      return users;
    }

    page += 1;
  }
}

async function getProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at");

  if (error) {
    throw new HttpError(
      502,
      "PROFILES_FETCH_FAILED",
      error.message
    );
  }

  return (data ?? []) as UserProfile[];
}

function getUserStatus(user: {
  banned_until?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  if (user.user_metadata?.account_status === "inactive") {
    return "inactive";
  }

  if (
    user.banned_until &&
    new Date(user.banned_until).getTime() > Date.now()
  ) {
    return "inactive";
  }

  return "active";
}

export async function getUsers(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<CrmUser[]> {
  requireAdminManager(actor);

  const [authUsers, profiles] = await Promise.all([
    listAuthUsers(supabase),
    getProfiles(supabase),
  ]);

  const profileById = new Map(
    profiles.map((profile) => [profile.id, profile])
  );

  return authUsers.map((user) => {
    const profile = profileById.get(user.id);

    return {
      id: user.id,
      full_name:
        profile?.full_name ??
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null),
      email: profile?.email ?? user.email ?? null,
      role: normalizeRole(
        profile?.role ??
          (typeof user.user_metadata?.role === "string"
            ? user.user_metadata.role
            : null)
      ),
      created_at: profile?.created_at ?? user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      status: getUserStatus(user),
    } as CrmUser;
  });
}

export async function createUser(
  supabase: SupabaseClient,
  payload: CreateUserPayload,
  actor: AuthenticatedUser
): Promise<CrmUser> {
  requireAdminManager(actor);

  const role = normalizeRole(payload.role);

  const { data, error } =
    await supabase.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.full_name.trim(),
        role,
        account_status: "active",
      },
    });

  if (error || !data.user) {
    throw new HttpError(
      error?.message.toLowerCase().includes("already")
        ? 409
        : 400,
      "USER_CREATE_FAILED",
      error?.message ?? "User could not be created."
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          full_name: payload.full_name.trim(),
          email: payload.email.trim().toLowerCase(),
          role,
        },
        {
          onConflict: "id",
        }
      )
      .select("id, full_name, email, role, created_at")
      .single<UserProfile>();

  if (profileError || !profile) {
    await supabase.auth.admin.deleteUser(data.user.id);

    throw new HttpError(
      500,
      "USER_PROFILE_CREATE_FAILED",
      profileError?.message ??
        "User profile could not be created."
    );
  }

  return {
    ...profile,
    status: "active",
    last_sign_in_at: data.user.last_sign_in_at,
  } as CrmUser;
}

export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  payload: UpdateUserRolePayload,
  actor: AuthenticatedUser
): Promise<CrmUser> {
  requireAdminManager(actor);

  const role = normalizeRole(payload.role);

  const { data: authData, error: authError } =
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        role,
      },
    });

  if (authError || !authData.user) {
    throw new HttpError(
      502,
      "USER_ROLE_AUTH_UPDATE_FAILED",
      authError?.message ?? "Auth role could not be updated."
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .update({
        role,
      })
      .eq("id", userId)
      .select("id, full_name, email, role, created_at")
      .single<UserProfile>();

  if (profileError || !profile) {
    throw new HttpError(
      502,
      "USER_ROLE_UPDATE_FAILED",
      profileError?.message ??
        "Profile role could not be updated."
    );
  }

  return {
    ...profile,
    status: getUserStatus(authData.user),
    last_sign_in_at: authData.user.last_sign_in_at,
  } as CrmUser;
}

export async function updateUserStatus(
  supabase: SupabaseClient,
  userId: string,
  payload: UpdateUserStatusPayload,
  actor: AuthenticatedUser
): Promise<CrmUser> {
  requireAdminManager(actor);

  const { data: existingUser, error: existingError } =
    await supabase.auth.admin.getUserById(userId);

  if (existingError || !existingUser.user) {
    throw new HttpError(
      404,
      "USER_NOT_FOUND",
      "User not found."
    );
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.updateUserById(userId, {
      ban_duration:
        payload.status === "inactive" ? "876000h" : "none",
      user_metadata: {
        ...existingUser.user.user_metadata,
        account_status: payload.status,
      },
    });

  if (authError || !authData.user) {
    throw new HttpError(
      502,
      "USER_STATUS_UPDATE_FAILED",
      authError?.message ??
        "User status could not be updated."
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("id", userId)
      .single<UserProfile>();

  if (profileError || !profile) {
    throw new HttpError(
      502,
      "USER_PROFILE_FETCH_FAILED",
      profileError?.message ?? "Profile could not be fetched."
    );
  }

  return {
    ...profile,
    status: payload.status,
    last_sign_in_at: authData.user.last_sign_in_at,
  } as CrmUser;
}

async function countRows(
  query: PromiseLike<{
    data: unknown[] | null;
    error: { code?: string; message: string } | null;
  }>
) {
  const { data, error } = await query;

  if (error) {
    if (isMissingColumnError(error)) {
      return 0;
    }

    throw new HttpError(502, "COUNT_FAILED", error.message);
  }

  return data?.length ?? 0;
}

export async function getSalesTeamStats(
  supabase: SupabaseClient,
  actor: AuthenticatedUser
): Promise<SalesTeamStat[]> {
  requireAdminManager(actor);

  const { data: salesProfiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "sales");

  if (error) {
    throw new HttpError(
      502,
      "SALES_USERS_FETCH_FAILED",
      error.message
    );
  }

  return Promise.all(
    ((salesProfiles ?? []) as UserProfile[]).map(
      async (profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        conversationsCount: await countRows(
          supabase
            .from("conversations")
            .select("id")
            .eq("assigned_to", profile.id)
        ),
        dealsCount: await countRows(
          supabase
            .from("deals")
            .select("id")
            .eq("owner_id", profile.id)
        ),
      })
    )
  );
}
