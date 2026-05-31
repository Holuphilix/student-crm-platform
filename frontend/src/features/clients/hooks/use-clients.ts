import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClient,
  getClientDetail,
  getClients,
  updateClient,
} from "@/features/clients/services/client.service";

import type {
  CreateClientPayload,
  UpdateClientPayload,
} from "@/features/clients/types/client.types";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
}

export function useClientDetail(clientId?: string) {
  return useQuery({
    queryKey: ["clients", clientId],
    queryFn: () => getClientDetail(clientId!),
    enabled: Boolean(clientId),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateClientPayload
    ) => createClient(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: string;
      payload: UpdateClientPayload;
    }) => updateClient(clientId, payload),

    onSuccess: (client) => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["clients", client.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });
}
