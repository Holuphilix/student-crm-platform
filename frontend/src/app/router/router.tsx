import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/app-layout";

import { ProtectedRoute } from "@/features/auth/components/protected-route";

import { ClientsPage } from "@/pages/clients-page";
import { ConversationsPage } from "@/pages/conversations-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { DealsPage } from "@/pages/deals-page";
import { LoginPage } from "@/pages/login-page";
import { SettingsPage } from "@/pages/settings-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ClientsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/conversations",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ConversationsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/deals",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DealsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <SettingsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },
]);