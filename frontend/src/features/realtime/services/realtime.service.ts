import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/supabase-client";

export type CrmRealtimeTable =
  | "clients"
  | "deals"
  | "conversations"
  | "deal_notes"
  | "deal_stage_history";

export type CrmRealtimePayload =
  RealtimePostgresChangesPayload<Record<string, unknown>>;

export type CrmRealtimeListener = (
  payload: CrmRealtimePayload
) => void;

type TableSubscription = {
  channel: RealtimeChannel;
  listeners: Set<CrmRealtimeListener>;
  refCount: number;
};

const subscriptions = new Map<
  CrmRealtimeTable,
  TableSubscription
>();

function getChannelName(table: CrmRealtimeTable) {
  return `crm-realtime-${table}`;
}

export function subscribeToRealtimeTable(
  table: CrmRealtimeTable,
  listener: CrmRealtimeListener
) {
  const existingSubscription =
    subscriptions.get(table);

  if (existingSubscription) {
    existingSubscription.listeners.add(listener);
    existingSubscription.refCount += 1;

    return () => {
      releaseRealtimeTableSubscription(
        table,
        listener
      );
    };
  }

  const listeners = new Set<CrmRealtimeListener>([
    listener,
  ]);

  const channel = supabase
    .channel(getChannelName(table))
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      (payload) => {
        listeners.forEach((currentListener) => {
          currentListener(payload);
        });
      }
    )
    .subscribe();

  subscriptions.set(table, {
    channel,
    listeners,
    refCount: 1,
  });

  return () => {
    releaseRealtimeTableSubscription(table, listener);
  };
}

export function subscribeToRealtimeTables(
  tables: CrmRealtimeTable[],
  listener: CrmRealtimeListener
) {
  const unsubscribeCallbacks = tables.map((table) =>
    subscribeToRealtimeTable(table, listener)
  );

  return () => {
    unsubscribeCallbacks.forEach((unsubscribe) => {
      unsubscribe();
    });
  };
}

function releaseRealtimeTableSubscription(
  table: CrmRealtimeTable,
  listener: CrmRealtimeListener
) {
  const currentSubscription =
    subscriptions.get(table);

  if (!currentSubscription) {
    return;
  }

  currentSubscription.listeners.delete(listener);
  currentSubscription.refCount -= 1;

  if (currentSubscription.refCount > 0) {
    return;
  }

  void supabase.removeChannel(
    currentSubscription.channel
  );
  subscriptions.delete(table);
}
