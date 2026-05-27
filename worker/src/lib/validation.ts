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
