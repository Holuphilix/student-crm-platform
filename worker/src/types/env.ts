import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  UserProfile,
  UserRole,
} from "./domain";

export type Env = {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CORS_ORIGIN?: string;
};

export type AuthenticatedUser = {
  id: string;
  email?: string;
  role: UserRole;
  profile: UserProfile;
};

export type AppVariables = {
  supabase: SupabaseClient;
  user: AuthenticatedUser;
  requestId: string;
};

export type AppBindings = {
  Bindings: Env;
  Variables: AppVariables;
};
