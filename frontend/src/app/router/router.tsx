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
import { ForgotPasswordPage } from "@/pages/forgot-password-page";
import { LoginPage } from "@/pages/login-page";
import { ProfilePage } from "@/pages/profile-page";
import { RegisterPage } from "@/pages/register-page";
import { ResetPasswordPage } from "@/pages/reset-password-page";
import { SettingsPage } from "@/pages/settings-page";
import { UsersPage } from "@/pages/users-page";

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
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },

  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
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
          <SettingsPage />
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <RoleProtectedRoute allowedRoles={["client", "user"]}>
            <ProfilePage />
          </RoleProtectedRoute>
        </AppLayout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
            <UsersPage />
          </RoleProtectedRoute>
        </AppLayout>
      </ProtectedRoute>
    ),
  },
]);
