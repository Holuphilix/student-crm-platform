import { supabase } from "@/lib/supabase/supabase-client";

import type { DashboardAnalyticsSource } from "@/features/dashboard/types/dashboard.types";

export async function getDashboardAnalyticsSource(): Promise<DashboardAnalyticsSource> {
  const [clientsResponse, conversationsResponse] =
    await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("conversations")
        .select("id", {
          count: "exact",
          head: true,
        }),
    ]);

  if (clientsResponse.error) {
    throw new Error(clientsResponse.error.message);
  }

  if (conversationsResponse.error) {
    throw new Error(conversationsResponse.error.message);
  }

  return {
    clients: clientsResponse.data ?? [],
    totalConversations:
      conversationsResponse.count ?? 0,
  };
}
