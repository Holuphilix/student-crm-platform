import { z } from "zod";

import {
  clientStatuses,
  conversationStatuses,
  conversationSenders,
  userRoles,
} from "../types/domain";

export const createClientSchema = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  country: z.string().trim().max(120).optional(),
  target_country: z.string().trim().max(120).optional(),
  status: z.enum(clientStatuses).default("new_lead"),
});

export const updateClientSchema = z.object({
  full_name: z.string().trim().min(1).max(160).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  target_country: z.string().trim().max(120).nullable().optional(),
});

export const registerUserSchema = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .regex(/[^A-Za-z0-9]/),
});

export const userIdParamSchema = z.object({
  userId: z.uuid(),
});

export const createUserSchema = z.object({
  full_name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .regex(/[^A-Za-z0-9]/),
  role: z.enum(userRoles),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(userRoles),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export const createConversationMessageSchema = z.object({
  client_id: z.uuid(),
  message: z.string().trim().min(1).max(5000),
  sender: z.enum(conversationSenders),
});

export const createConversationReplySchema = z.object({
  message: z.string().trim().min(1).max(5000),
  sender: z.enum(conversationSenders).default("agent"),
});

export const clientIdParamSchema = z.object({
  clientId: z.uuid(),
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

export const updateDealOwnerSchema = z.object({
  owner_id: z.uuid().nullable(),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.uuid(),
});

export const assignConversationSchema = z.object({
  assigned_to: z.uuid().nullable(),
});

export const updateConversationStatusSchema = z.object({
  status: z.enum(conversationStatuses),
});

export const createDealNoteSchema = z.object({
  deal_id: z.uuid(),
  author_id: z.uuid().optional(),
  body: z.string().trim().min(1).max(5000),
});

export const createScopedDealNoteSchema = z.object({
  author_id: z.uuid().optional(),
  body: z.string().trim().min(1).max(5000),
});
