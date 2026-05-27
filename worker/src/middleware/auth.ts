import type { MiddlewareHandler } from "hono";

import { errorResponse } from "../lib/api-response";
import { createSupabaseAdminClient } from "../lib/supabase";
import type { AppBindings } from "../types/env";

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

  c.set("supabase", supabase);

  c.set("user", {
    id: "development-user",
    email: "dev@studentcrm.com",
  });

  await next();
};