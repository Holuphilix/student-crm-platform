import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/use-auth";
import type { UserRole } from "@/features/auth/types/auth.types";
import { canAccessRole } from "@/features/auth/utils/role-check";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: readonly UserRole[];
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRole(role, allowedRoles)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Unauthorized
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return children;
}
