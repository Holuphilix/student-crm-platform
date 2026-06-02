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

      <SidebarInset className="bg-background">
        <AppHeader />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5">
            <SidebarTrigger />
          </div>

          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
