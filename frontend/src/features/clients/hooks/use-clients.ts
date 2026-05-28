import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClient,
  getClientDetail,
  getClients,
} from "@/features/clients/services/client.service";

import type {
  CreateClientPayload,
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
