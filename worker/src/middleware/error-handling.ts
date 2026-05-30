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
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;

  console.error(
    JSON.stringify({
      requestId,
      method,
      path,
      event: "request_error",
      code:
        error instanceof HttpError
          ? error.code
          : "UNHANDLED_ERROR",
      status:
        error instanceof HttpError
          ? error.status
          : undefined,
      message: error.message,
      details:
        error instanceof HttpError
          ? error.details
          : undefined,
      stack: error.stack,
    })
  );

  if (error instanceof HttpError) {
    return errorResponse(
      c,
      error.code,
      error.message,
      error.status,
      {
        requestId,
        path,
        ...(error.details &&
        typeof error.details === "object" &&
        !Array.isArray(error.details)
          ? error.details
          : { details: error.details }),
      }
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      c,
      "VALIDATION_ERROR",
      "Request validation failed.",
      400,
      {
        requestId,
        path,
        issues: error.issues,
      }
    );
  }

  if (error instanceof HTTPException) {
    return errorResponse(
      c,
      "HTTP_ERROR",
      error.message,
      error.status,
      {
        requestId,
        path,
      }
    );
  }

  return errorResponse(
    c,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred.",
    500,
    {
      requestId,
      path,
    }
  );
};
