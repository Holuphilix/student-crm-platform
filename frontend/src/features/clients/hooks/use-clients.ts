import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClient,
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
    },
  });
}