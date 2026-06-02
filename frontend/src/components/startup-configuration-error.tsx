import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { supabaseConfigurationMessage } from "@/lib/supabase/supabase-client";

export function StartupConfigurationError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg rounded-lg">
        <CardHeader>
          <CardTitle>
            Student CRM is not configured
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{supabaseConfigurationMessage}</p>

          <div className="rounded-lg bg-muted p-3 text-xs text-foreground">
            Required build variables:
            <br />
            VITE_SUPABASE_URL
            <br />
            VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
