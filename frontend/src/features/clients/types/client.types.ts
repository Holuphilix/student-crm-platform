export const clientStatuses = [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export type ClientStatus =
  (typeof clientStatuses)[number];

export type Client = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: ClientStatus;
  created_at: string;
};

export type CreateClientPayload = {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: ClientStatus;
};
