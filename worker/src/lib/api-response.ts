import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "../types/api";

export function successResponse<T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200,
  meta?: Record<string, unknown>
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  return c.json(body, status);
}

export function errorResponse(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };

  return c.json(body, status);
}
