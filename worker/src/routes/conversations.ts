import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { errorResponse, successResponse } from "../lib/api-response";
import { createConversationMessageSchema } from "../lib/validation";
import {
  createConversationMessage,
  getConversations,
} from "../services/conversation.service";
import type { AppBindings } from "../types/env";

export const conversationsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const conversations = await getConversations(
      c.get("supabase")
    );

    return successResponse(c, conversations);
  })
  .post(
    "/",
    zValidator(
      "json",
      createConversationMessageSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation payload is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    async (c) => {
      const payload = c.req.valid("json");
      const conversation = await createConversationMessage(
        c.get("supabase"),
        payload,
        c.get("user").id
      );

      return successResponse(c, conversation, 201);
    }
  );
