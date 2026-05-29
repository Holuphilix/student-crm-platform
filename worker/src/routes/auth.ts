import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  errorResponse,
  successResponse,
} from "../lib/api-response";
import { createSupabaseAdminClient } from "../lib/supabase";
import { registerUserSchema } from "../lib/validation";
import { registerUser } from "../services/auth.service";
import type { AppBindings } from "../types/env";

export const authRoute = new Hono<AppBindings>().post(
  "/register",
  zValidator("json", registerUserSchema, (result, c) => {
    if (!result.success) {
      return errorResponse(
        c,
        "VALIDATION_ERROR",
        "Registration payload is invalid.",
        400,
        result.error.issues
      );
    }
  }),
  async (c) => {
    const payload = c.req.valid("json");
    const supabase = createSupabaseAdminClient(c.env);
    const registration = await registerUser(
      supabase,
      payload
    );

    return successResponse(c, registration, 201);
  }
);
