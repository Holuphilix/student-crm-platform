import { AnalyticsDashboard } from "@/features/dashboard/components/analytics-dashboard";
import { ClientDashboard } from "@/features/dashboard/components/client-dashboard";
import { SalesDashboard } from "@/features/dashboard/components/sales-dashboard";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  getRoleDisplayName,
  getUserDisplayName,
} from "@/features/auth/utils/user-display";

export function DashboardPage() {
  const { user, profile, role } = useAuth();
  const displayName = getUserDisplayName(
    user,
    profile
  );
  const roleLabel = getRoleDisplayName(role);
  const isClient = role === "client" || role === "user";
  const isSales = role === "sales";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {displayName}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {roleLabel}
        </p>
      </div>

      {isClient ? (
        <ClientDashboard />
      ) : isSales ? (
        <SalesDashboard />
      ) : (
        <AnalyticsDashboard />
      )}
    </div>
  );
}
