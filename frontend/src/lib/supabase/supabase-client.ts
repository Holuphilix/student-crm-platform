import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://placeholder.supabase.co";
const fallbackSupabasePublishableKey = "missing-supabase-key";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "";

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabasePublishableKey);

export const supabaseConfigurationMessage =
  "Cloudflare is serving the React bundle, but Supabase build-time environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild and redeploy.";

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigurationMessage);
  }
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackSupabaseUrl,
  isSupabaseConfigured
    ? supabasePublishableKey
    : fallbackSupabasePublishableKey
);
