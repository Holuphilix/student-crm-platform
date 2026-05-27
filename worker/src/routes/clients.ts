import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { errorResponse, successResponse } from "../lib/api-response";
import { createClientSchema } from "../lib/validation";
import {
  createClient,
  getClients,
} from "../services/client.service";
import type { AppBindings } from "../types/env";

export const clientsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const clients = await getClients(c.get("supabase"));

    return successResponse(c, clients);
  })
  .post(
    "/",
    zValidator("json", createClientSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Client payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const payload = c.req.valid("json");
      const client = await createClient(
        c.get("supabase"),
        payload
      );

      return successResponse(c, client, 201);
    }
  );
