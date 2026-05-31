import { Hono } from "hono";

import { successResponse } from "../lib/api-response";
import type { AppBindings } from "../types/env";

export const meRoute = new Hono<AppBindings>().get("/", (c) =>
  successResponse(c, {
    user: c.get("user"),
    profile: c.get("user").profile,
  })
);
