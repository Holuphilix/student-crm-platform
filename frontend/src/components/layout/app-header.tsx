import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useAuth } from "@/features/auth/hooks/use-auth";

export function AppHeader() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login", {
        replace: true,
      });
    } catch {
      toast.error("Failed to sign out.");
    }
  }

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Student CRM Platform
          </h1>

          <p className="text-sm text-muted-foreground">
            Education sales management system
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />

          Logout
        </Button>
      </div>
    </header>
  );
}
