import { createClient } from "@supabase/supabase-js";

import type { Env } from "../types/env";
import { HttpError } from "./http-error";

export function createSupabaseAdminClient(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(
      500,
      "CONFIGURATION_ERROR",
      "Supabase environment variables are not configured."
    );
  }

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
