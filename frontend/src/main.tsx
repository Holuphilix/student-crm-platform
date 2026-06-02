import React from "react";

import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { Toaster } from "sonner";

import "./index.css";

import { QueryProvider } from "@/app/providers/query-provider";

import { router } from "@/app/router/router";

import { AppErrorBoundary } from "@/components/app-error-boundary";
import { StartupConfigurationError } from "@/components/startup-configuration-error";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { isSupabaseConfigured } from "@/lib/supabase/supabase-client";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {isSupabaseConfigured ? (
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>

            <Toaster richColors />
          </AuthProvider>
        </QueryProvider>
      ) : (
        <StartupConfigurationError />
      )}
    </AppErrorBoundary>
  </React.StrictMode>
);
