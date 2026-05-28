import type { ReactNode } from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

import { useClientRealtime } from "@/features/realtime/hooks/use-client-realtime";
import { useConversationRealtime } from "@/features/realtime/hooks/use-conversation-realtime";
import { useDashboardRealtime } from "@/features/realtime/hooks/use-dashboard-realtime";
import { useDealRealtime } from "@/features/realtime/hooks/use-deal-realtime";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({
  children,
}: AppLayoutProps) {
  useDashboardRealtime();
  useClientRealtime();
  useConversationRealtime();
  useDealRealtime();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <main className="flex-1 p-6">
          <div className="mb-4">
            <SidebarTrigger />
          </div>

          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
