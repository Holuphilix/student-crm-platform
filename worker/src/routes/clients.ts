import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { errorResponse, successResponse } from "../lib/api-response";
import {
  clientIdParamSchema,
  createClientSchema,
  updateClientSchema,
} from "../lib/validation";
import {
  createClient,
  getClientDetail,
  getClients,
  updateClient,
} from "../services/client.service";
import type { AppBindings } from "../types/env";

export const clientsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const clients = await getClients(
      c.get("supabase"),
      c.get("user")
    );

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
        clientId,
        c.get("user")
      );

      return successResponse(c, clientDetail);
    }
  )
  .patch(
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
    zValidator("json", updateClientSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Client update payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { clientId } = c.req.valid("param");
      const payload = c.req.valid("json");
      const client = await updateClient(
        c.get("supabase"),
        clientId,
        payload,
        c.get("user")
      );

      return successResponse(c, client);
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
        c.get("user")
      );

      return successResponse(c, client, 201);
    }
  );
