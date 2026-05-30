import { createClient } from "@supabase/supabase-js";

import type { Env } from "../types/env";
import { HttpError } from "./http-error";

function getMissingSupabaseVariables(env: Env) {
  return [
    ["SUPABASE_URL", env.SUPABASE_URL],
    [
      "SUPABASE_SERVICE_ROLE_KEY",
      env.SUPABASE_SERVICE_ROLE_KEY,
    ],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

export function getSupabaseEnvironmentDiagnostics(env: Env) {
  const missingVariables =
    getMissingSupabaseVariables(env);

  return {
    configuredVariables: {
      SUPABASE_URL: Boolean(env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(
        env.SUPABASE_SERVICE_ROLE_KEY
      ),
    },
    missingVariables,
    isConfigured: missingVariables.length === 0,
  };
}

export function createSupabaseAdminClient(env: Env) {
  const diagnostics =
    getSupabaseEnvironmentDiagnostics(env);

  if (!diagnostics.isConfigured) {
    throw new HttpError(
      500,
      "CONFIGURATION_ERROR",
      "Supabase Worker environment variables are not configured.",
      {
        ...diagnostics,
        resolution:
          "Add these as Cloudflare Worker secrets or environment variables for the student-crm-platform Worker, then redeploy.",
      }
    );
  }

  return createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
