import { z } from "zod";

import {
  clientStatuses,
  conversationSenders,
} from "../types/domain";

export const createClientSchema = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  status: z.enum(clientStatuses).default("lead"),
});

export const createConversationMessageSchema = z.object({
  client_id: z.uuid(),
  message: z.string().trim().min(1).max(5000),
  sender: z.enum(conversationSenders),
});

export const dealIdParamSchema = z.object({
  dealId: z.uuid(),
});

export const createDealSchema = z.object({
  client_id: z.uuid(),
  owner_id: z.uuid().optional(),
  title: z.string().trim().min(1).max(200),
  value_amount: z.number().nonnegative().optional(),
  expected_intake: z.string().trim().max(120).optional(),
});

export const updateDealStageSchema = z.object({
  stage: z.enum(clientStatuses),
  lost_reason: z.string().trim().max(500).optional(),
});

export const createDealNoteSchema = z.object({
  deal_id: z.uuid(),
  author_id: z.uuid().optional(),
  body: z.string().trim().min(1).max(5000),
});
