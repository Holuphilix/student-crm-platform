import { Hono } from "hono";

import { successResponse } from "../lib/api-response";
import { getDashboardAnalytics } from "../services/dashboard.service";
import type { AppBindings } from "../types/env";

export const dashboardRoute = new Hono<AppBindings>().get(
  "/",
  async (c) => {
    const dashboard = await getDashboardAnalytics(
      c.get("supabase"),
      {
        requestId: c.get("requestId"),
        actor: c.get("user"),
      }
    );

    return successResponse(c, dashboard, 200, {
      requestId: c.get("requestId"),
    });
  }
);
