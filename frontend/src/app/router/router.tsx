import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/app-layout";

import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { PublicOnlyRoute } from "@/features/auth/components/public-only-route";
import { RoleProtectedRoute } from "@/features/auth/components/role-protected-route";

import { ClientDetailPage } from "@/pages/client-detail-page";
import { ClientsPage } from "@/pages/clients-page";
import { ConversationsPage } from "@/pages/conversations-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { DealDetailPage } from "@/pages/deal-detail-page";
import { DealsPage } from "@/pages/deals-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { SettingsPage } from "@/pages/settings-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },

  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
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
    path: "/clients/:clientId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <ClientDetailPage />
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
    path: "/deals/:dealId",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <DealDetailPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </RoleProtectedRoute>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
]);
