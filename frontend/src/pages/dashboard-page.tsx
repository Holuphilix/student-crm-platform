import { AnalyticsDashboard } from "@/features/dashboard/components/analytics-dashboard";
import { ClientDashboard } from "@/features/dashboard/components/client-dashboard";
import { SalesDashboard } from "@/features/dashboard/components/sales-dashboard";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { BadgeCheck } from "lucide-react";
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
      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BadgeCheck className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {displayName}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {roleLabel}
            </p>
          </div>
        </div>
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
