import { Hono } from "hono";
import { cors } from "hono/cors";

import {
  errorResponse,
  successResponse,
} from "./lib/api-response";

import { authMiddleware } from "./middleware/auth";
import { errorHandlingMiddleware } from "./middleware/error-handling";
import { requestLoggingMiddleware } from "./middleware/request-logging";

import { clientsRoute } from "./routes/clients";
import { conversationsRoute } from "./routes/conversations";
import { dashboardRoute } from "./routes/dashboard";
import { dealsRoute } from "./routes/deals";

import type { AppBindings } from "./types/env";

const app = new Hono<AppBindings>();

const localFrontendOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function getAllowedOrigins(corsOrigin?: string) {
  return new Set([
    ...localFrontendOrigins,
    ...(corsOrigin
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ]);
}

app.use("*", requestLoggingMiddleware);

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      if (!origin) {
        return null;
      }

      const allowedOrigins = getAllowedOrigins(
        c.env.CORS_ORIGIN
      );

      return allowedOrigins.has(origin)
        ? origin
        : null;
    },

    allowHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
    ],

    allowMethods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    credentials: true,

    maxAge: 86400,
  })
);

app.onError(errorHandlingMiddleware);

app.get("/health", (c) =>
  successResponse(c, {
    status: "ok",
  })
);

app.get("/", (c) =>
  successResponse(c, {
    name: "Student CRM API",
    status: "running",
    version: "v1",
  })
);

app.use("/api/*", authMiddleware);

app.route("/api/clients", clientsRoute);

app.route(
  "/api/conversations",
  conversationsRoute
);

app.route(
  "/api/dashboard",
  dashboardRoute
);

app.route("/api/deals", dealsRoute);

app.notFound((c) =>
  errorResponse(
    c,
    "NOT_FOUND",
    "The requested resource was not found.",
    404
  )
);

export default app;
