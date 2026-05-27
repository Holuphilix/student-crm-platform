import { apiClient } from "@/lib/api/client";

import type {
  Client,
  CreateClientPayload,
} from "@/features/clients/types/client.types";

export async function getClients(): Promise<Client[]> {
  return apiClient<Client[]>("/api/clients");
}

export async function createClient(
  payload: CreateClientPayload
): Promise<Client> {
  return apiClient<Client>("/api/clients", {
    method: "POST",

    body: JSON.stringify(payload),
  });
}