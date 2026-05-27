import type { MiddlewareHandler } from "hono";

import type { AppBindings } from "../types/env";

export const requestLoggingMiddleware: MiddlewareHandler<
  AppBindings
> = async (c, next) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  c.set("requestId", requestId);

  console.log(
    JSON.stringify({
      requestId,
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      event: "request_started",
    })
  );

  try {
    await next();
  } finally {
    console.log(
      JSON.stringify({
        requestId,
        method: c.req.method,
        path: new URL(c.req.url).pathname,
        status: c.res.status,
        durationMs: Date.now() - startedAt,
        event: "request_finished",
      })
    );
  }
};
