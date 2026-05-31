import type { MiddlewareHandler } from "hono";

import { errorResponse } from "../lib/api-response";
import { createSupabaseAdminClient } from "../lib/supabase";
import { isMissingColumnError } from "../lib/legacy-stage";
import type { AppBindings } from "../types/env";
import type { UserProfile } from "../types/domain";

function getBearerToken(
  authorizationHeader: string | null
) {
  if (
    !authorizationHeader?.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorizationHeader
    .slice("Bearer ".length)
    .trim();
}

export const authMiddleware: MiddlewareHandler<
  AppBindings
> = async (c, next) => {
  const token = getBearerToken(
    c.req.header("Authorization") ?? null
  );

  if (!token) {
    return errorResponse(
      c,
      "UNAUTHORIZED",
      "Missing bearer token.",
      401
    );
  }

  const supabase =
    createSupabaseAdminClient(c.env);

  const { data, error } =
    await supabase.auth.getUser(token);

  if (error || !data.user) {
    return errorResponse(
      c,
      "UNAUTHORIZED",
      "Invalid or expired bearer token.",
      401
    );
  }

  let { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at")
      .eq("id", data.user.id)
      .maybeSingle<UserProfile>();

  if (profileError && isMissingColumnError(profileError)) {
    const fallbackProfileResponse = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("id", data.user.id)
      .maybeSingle<UserProfile>();

    profile = fallbackProfileResponse.data;
    profileError = fallbackProfileResponse.error;
  }

  if (profileError) {
    return errorResponse(
      c,
      "PROFILE_FETCH_FAILED",
      profileError.message,
      502
    );
  }

  const resolvedProfile: UserProfile =
    profile ?? {
      id: data.user.id,
      full_name:
        typeof data.user.user_metadata?.full_name ===
        "string"
          ? data.user.user_metadata.full_name
          : null,
      email: data.user.email ?? null,
      role: "user",
      created_at: null,
    };

  c.set("supabase", supabase);
  c.set("user", {
    id: data.user.id,
    email: data.user.email,
    role: resolvedProfile.role,
    profile: resolvedProfile,
  });

  await next();
};
