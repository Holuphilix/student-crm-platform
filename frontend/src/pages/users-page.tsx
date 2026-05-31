import { Card, CardContent } from "@/components/ui/card";

import { CreateUserCard } from "@/features/users/components/create-user-card";
import { SalesTeamCard } from "@/features/users/components/sales-team-card";
import { UsersTable } from "@/features/users/components/users-table";
import {
  useSalesTeamStats,
  useUsers,
} from "@/features/users/hooks/use-users";

export function UsersPage() {
  const {
    data: users = [],
    isLoading,
    isError,
  } = useUsers();
  const {
    data: salesStats = [],
    isLoading: isLoadingSalesStats,
  } = useSalesTeamStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage CRM access, roles, and sales team ownership.
        </p>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Failed to load users.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CreateUserCard />
          <SalesTeamCard
            stats={salesStats}
            isLoading={isLoadingSalesStats}
          />
          <UsersTable
            users={users}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
