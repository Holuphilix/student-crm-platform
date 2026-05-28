import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  errorResponse,
  successResponse,
} from "../lib/api-response";
import {
  createDealNoteSchema,
  createDealSchema,
  dealIdParamSchema,
  updateDealStageSchema,
} from "../lib/validation";
import {
  addDealNote,
  createDeal,
  getDeals,
  updateDealStage,
} from "../services/deal.service";
import type { AppBindings } from "../types/env";

export const dealsRoute = new Hono<AppBindings>()
  .get("/", async (c) => {
    const deals = await getDeals(c.get("supabase"));

    return successResponse(c, deals);
  })
  .post(
    "/",
    zValidator("json", createDealSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Deal payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const payload = c.req.valid("json");
      const deal = await createDeal(
        c.get("supabase"),
        payload,
        c.get("user").id
      );

      return successResponse(c, deal, 201);
    }
  )
  .patch(
    "/:dealId/stage",
    zValidator("param", dealIdParamSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Deal id is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    zValidator("json", updateDealStageSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Deal stage payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const { dealId } = c.req.valid("param");
      const payload = c.req.valid("json");

      const deal = await updateDealStage(
        c.get("supabase"),
        dealId,
        payload,
        c.get("user").id
      );

      return successResponse(c, deal);
    }
  )
  .post(
    "/notes",
    zValidator("json", createDealNoteSchema, (result, c) => {
      if (!result.success) {
        return errorResponse(
          c,
          "VALIDATION_ERROR",
          "Deal note payload is invalid.",
          400,
          result.error.issues
        );
      }
    }),
    async (c) => {
      const payload = c.req.valid("json");
      const note = await addDealNote(
        c.get("supabase"),
        {
          deal_id: payload.deal_id,
          author_id:
            payload.author_id ?? c.get("user").id,
          body: payload.body,
        }
      );

      return successResponse(c, note, 201);
    }
  );
