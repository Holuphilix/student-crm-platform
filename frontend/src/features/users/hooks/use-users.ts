import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUser,
  getSalesTeamStats,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "@/features/users/services/user.service";

import type {
  CreateUserPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from "@/features/users/types/user.types";

export function useUsers(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: options.enabled ?? true,
  });
}

export function useSalesTeamStats(
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: ["users", "sales-stats"],
    queryFn: getSalesTeamStats,
    enabled: options.enabled ?? true,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserRolePayload;
    }) => updateUserRole(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserStatusPayload;
    }) => updateUserStatus(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
