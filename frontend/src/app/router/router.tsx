import { createBrowserRouter } from "react-router-dom";

import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";

import { ProtectedRoute } from "@/features/auth/components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);