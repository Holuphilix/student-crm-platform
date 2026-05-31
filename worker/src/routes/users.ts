import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  errorResponse,
  successResponse,
} from "../lib/api-response";
import {
  createUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdParamSchema,
} from "../lib/validation";
import {
  createUser,
  getSalesTeamStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/user.service";
import type { AppBindings } from "../types/env";

export const usersRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const users = await getUsers(
      c.get("supabase"),
      c.get("user")
    );

    return successResponse(c, users);
  })
  .post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "User payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const user = await createUser(
        c.get("supabase"),
        c.req.valid("json"),
        c.get("user")
      );

      return successResponse(c, user, 201);
    }
  )
  .get("/sales-stats", async (c) => {
    const stats = await getSalesTeamStats(
      c.get("supabase"),
      c.get("user")
    );

    return successResponse(c, stats);
  })
  .patch(
    "/:userId/role",
    zValidator("param", userIdParamSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "User id is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    zValidator("json", updateUserRoleSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "User role payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { userId } = c.req.valid("param");
      const user = await updateUserRole(
        c.get("supabase"),
        userId,
        c.req.valid("json"),
        c.get("user")
      );

      return successResponse(c, user);
    }
  )
  .patch(
    "/:userId/status",
    zValidator("param", userIdParamSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "User id is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    zValidator("json", updateUserStatusSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "User status payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { userId } = c.req.valid("param");
      const user = await updateUserStatus(
        c.get("supabase"),
        userId,
        c.req.valid("json"),
        c.get("user")
      );

      return successResponse(c, user);
    }
  );
