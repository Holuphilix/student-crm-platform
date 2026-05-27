import { Hono } from "hono";

import { successResponse } from "../lib/api-response";
import { getDashboardAnalytics } from "../services/dashboard.service";
import type { AppBindings } from "../types/env";

export const dashboardRoute = new Hono<AppBindings>().get(
  "/",
  async (c) => {
    const dashboard = await getDashboardAnalytics(
      c.get("supabase")
    );

    return successResponse(c, dashboard);
  }
);
