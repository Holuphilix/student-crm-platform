import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";

type PublicOnlyRouteProps = {
  children: ReactNode;
};

export function PublicOnlyRoute({
  children,
}: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
