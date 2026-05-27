import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { errorResponse } from "../lib/api-response";
import { HttpError } from "../lib/http-error";
import type { AppBindings } from "../types/env";

export const errorHandlingMiddleware: ErrorHandler<
  AppBindings
> = (error, c) => {
  const requestId = c.get("requestId");

  console.error(
    JSON.stringify({
      requestId,
      event: "request_error",
      message: error.message,
      stack: error.stack,
    })
  );

  if (error instanceof HttpError) {
    return errorResponse(
      c,
      error.code,
      error.message,
      error.status,
      error.details
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      c,
      "VALIDATION_ERROR",
      "Request validation failed.",
      400,
      error.issues
    );
  }

  if (error instanceof HTTPException) {
    return errorResponse(
      c,
      "HTTP_ERROR",
      error.message,
      error.status
    );
  }

  return errorResponse(
    c,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred.",
    500
  );
};
