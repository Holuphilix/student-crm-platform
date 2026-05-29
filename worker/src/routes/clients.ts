import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { errorResponse, successResponse } from "../lib/api-response";
import {
  clientIdParamSchema,
  createClientSchema,
} from "../lib/validation";
import {
  createClient,
  getClientDetail,
  getClients,
} from "../services/client.service";
import type { AppBindings } from "../types/env";

export const clientsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const clients = await getClients(c.get("supabase"));

    return successResponse(c, clients);
  })
  .get(
    "/:clientId",
    zValidator("param", clientIdParamSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Client id is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { clientId } = c.req.valid("param");
      const clientDetail = await getClientDetail(
        c.get("supabase"),
        clientId
      );

      return successResponse(c, clientDetail);
    }
  )
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
        payload,
        c.get("user").id
      );

      return successResponse(c, client, 201);
    }
  );
