import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  CORS_ORIGIN?: string;
};

export type AppVariables = {
  supabase: SupabaseClient;
  user: User;
  requestId: string;
};

export type AppBindings = {
  Bindings: Env;
  Variables: AppVariables;
};
