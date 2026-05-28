import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createConversationMessage,
  getConversationMessages,
} from "@/features/conversations/services/conversation.service";

import type {
  ConversationMessage,
  CreateConversationMessagePayload,
} from "@/features/conversations/types/conversation.types";

const conversationsQueryKey = ["conversations"];

function upsertConversationMessage(
  messages: ConversationMessage[] = [],
  nextMessage: ConversationMessage
) {
  const messageExists = messages.some(
    (message) => message.id === nextMessage.id
  );

  const nextMessages = messageExists
    ? messages.map((message) =>
        message.id === nextMessage.id
          ? nextMessage
          : message
      )
    : [...messages, nextMessage];

  return nextMessages.sort(
    (firstMessage, secondMessage) =>
      new Date(firstMessage.created_at).getTime() -
      new Date(secondMessage.created_at).getTime()
  );
}

export function useConversations() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: conversationsQueryKey,
    queryFn: getConversationMessages,
  });

  const createMessageMutation = useMutation({
    mutationFn: (
      payload: CreateConversationMessagePayload
    ) => createConversationMessage(payload),

    onSuccess: (message) => {
      queryClient.setQueryData<ConversationMessage[]>(
        conversationsQueryKey,
        (currentMessages) =>
          upsertConversationMessage(
            currentMessages,
            message
          )
      );
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-analytics"],
      });
    },
  });

  return {
    ...query,
    createMessage: createMessageMutation.mutateAsync,
    isCreatingMessage: createMessageMutation.isPending,
  };
}
