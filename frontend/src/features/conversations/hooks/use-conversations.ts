import { useEffect } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/supabase-client";

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
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          queryClient.setQueryData<
            ConversationMessage[]
          >(
            conversationsQueryKey,
            (currentMessages) =>
              upsertConversationMessage(
                currentMessages,
                payload.new as ConversationMessage
              )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    createMessage: createMessageMutation.mutateAsync,
    isCreatingMessage: createMessageMutation.isPending,
  };
}
