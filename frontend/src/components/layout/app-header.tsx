import { LogOut, ShieldCheck } from "lucide-react";
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
    <header className="border-b bg-card/90 px-4 py-4 shadow-xs backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="text-xl font-bold sm:text-2xl">
              Student CRM Platform
            </h1>
          </div>

          <p className="text-sm text-muted-foreground">
            Education sales management system
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border bg-background/60 p-3 shadow-xs sm:flex-row sm:items-center sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
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
