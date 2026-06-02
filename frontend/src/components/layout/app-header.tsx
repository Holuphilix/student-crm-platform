import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/common/avatar-initials";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  getRoleDisplayName,
  getUserDisplayEmail,
  getUserDisplayName,
} from "@/features/auth/utils/user-display";

export function AppHeader() {
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const displayName = getUserDisplayName(
    user,
    profile
  );
  const displayEmail = getUserDisplayEmail(
    user,
    profile
  );
  const roleLabel = getRoleDisplayName(role);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await signOut();
      toast.success("Logged out successfully.");
      navigate("/login", {
        replace: true,
      });
    } catch {
      toast.error("Failed to sign out.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Student CRM Platform
          </h1>

          <p className="text-sm text-muted-foreground">
            Education sales management system
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AvatarInitials
            name={displayName}
            email={displayEmail}
          />
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-foreground">
              {displayName}
            </p>

            <p className="text-xs text-muted-foreground">
              {displayEmail}
            </p>

            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {roleLabel}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />

            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
