import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { errorResponse, successResponse } from "../lib/api-response";
import {
  assignConversationSchema,
  conversationIdParamSchema,
  createConversationReplySchema,
  createConversationMessageSchema,
  updateConversationStatusSchema,
} from "../lib/validation";
import {
  assignConversation,
  createConversationMessage,
  getConversationDetail,
  getConversations,
  replyToConversation,
  updateConversationStatus,
} from "../services/conversation.service";
import type { AppBindings } from "../types/env";

export const conversationsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const conversations = await getConversations(
      c.get("supabase"),
      c.get("user")
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
        c.get("user")
      );

      return successResponse(c, conversation, 201);
    }
  )
  .get(
    "/:conversationId",
    zValidator(
      "param",
      conversationIdParamSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation id is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    async (c) => {
      const { conversationId } = c.req.valid("param");
      const conversations = await getConversationDetail(
        c.get("supabase"),
        conversationId,
        c.get("user")
      );

      return successResponse(c, conversations);
    }
  )
  .post(
    "/:conversationId/messages",
    zValidator(
      "param",
      conversationIdParamSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation id is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    zValidator(
      "json",
      createConversationReplySchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation message payload is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    async (c) => {
      const { conversationId } = c.req.valid("param");
      const payload = c.req.valid("json");
      const conversation = await replyToConversation(
        c.get("supabase"),
        conversationId,
        payload,
        c.get("user")
      );

      return successResponse(c, conversation, 201);
    }
  )
  .patch(
    "/:conversationId/assign",
    zValidator(
      "param",
      conversationIdParamSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation id is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    zValidator("json", assignConversationSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Conversation assignment payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { conversationId } = c.req.valid("param");
      const payload = c.req.valid("json");

      const conversations = await assignConversation(
        c.get("supabase"),
        conversationId,
        payload,
        c.get("user")
      );

      return successResponse(c, conversations);
    }
  )
  .patch(
    "/:conversationId/status",
    zValidator(
      "param",
      conversationIdParamSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation id is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    zValidator(
      "json",
      updateConversationStatusSchema,
      (result, c) => {
        if (!result.success) {
          return errorResponse(
            c,
            "VALIDATION_ERROR",
            "Conversation status payload is invalid.",
            400,
            result.error.issues
          );
        }
      }
    ),
    async (c) => {
      const { conversationId } = c.req.valid("param");
      const payload = c.req.valid("json");

      const conversations =
        await updateConversationStatus(
          c.get("supabase"),
          conversationId,
          payload,
          c.get("user")
        );

      return successResponse(c, conversations);
    }
  );
