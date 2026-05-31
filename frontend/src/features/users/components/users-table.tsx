import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useUpdateUserRole,
  useUpdateUserStatus,
} from "@/features/users/hooks/use-users";
import type { CrmUser } from "@/features/users/types/user.types";
import { getFriendlyDisplayName } from "@/features/auth/utils/user-display";

type UsersTableProps = {
  users: CrmUser[];
  isLoading: boolean;
};

const roleOptions = [
  ["admin", "Admin"],
  ["sales", "Sales"],
  ["user", "Client"],
] as const;

function formatDate(value?: string | null) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsersTable({
  users,
  isLoading,
}: UsersTableProps) {
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();

  async function handleRoleChange(
    userId: string,
    role: CrmUser["role"]
  ) {
    try {
      await updateRoleMutation.mutateAsync({
        userId,
        payload: {
          role,
        },
      });
      toast.success("Role updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update role."
      );
    }
  }

  async function handleStatusToggle(user: CrmUser) {
    try {
      await updateStatusMutation.mutateAsync({
        userId: user.id,
        payload: {
          status:
            user.status === "active"
              ? "inactive"
              : "active",
        },
      });
      toast.success("User status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update user status."
      );
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {getFriendlyDisplayName({
                      full_name: user.full_name,
                      email: user.email,
                      fallback: "CRM User",
                    })}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <select
                      value={
                        user.role === "manager"
                          ? "admin"
                          : user.role
                      }
                      className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
                      disabled={
                        updateRoleMutation.isPending
                      }
                      onChange={(event) =>
                        handleRoleChange(
                          user.id,
                          event.target.value as CrmUser["role"]
                        )
                      }
                    >
                      {roleOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.last_sign_in_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        updateStatusMutation.isPending
                      }
                      onClick={() =>
                        handleStatusToggle(user)
                      }
                    >
                      {user.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
