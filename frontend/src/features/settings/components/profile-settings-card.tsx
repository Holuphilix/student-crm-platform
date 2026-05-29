import { useMemo } from "react";

import type { User } from "@supabase/supabase-js";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UserProfile } from "@/features/auth/types/auth.types";
import { getRoleDisplayName } from "@/features/auth/utils/user-display";

type ProfileSettingsCardProps = {
  user: User;
  profile: UserProfile | null;
};

function getUserFullName(
  profile: UserProfile | null
) {
  if (profile?.full_name) {
    return profile.full_name;
  }

  return "";
}

export function ProfileSettingsCard({
  user,
  profile,
}: ProfileSettingsCardProps) {
  const fullName = useMemo(
    () => getUserFullName(profile),
    [profile]
  );

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              Profile
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your account identity aligned with CRM activity.
            </p>
          </div>

          <Badge variant="secondary" className="capitalize">
            {getRoleDisplayName(profile?.role ?? null)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-full-name">
              Full Name
            </Label>

            <Input
              id="settings-full-name"
              value={fullName}
              disabled
            />

            <p className="text-xs text-muted-foreground">
              Full name is managed by your organization.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-email">
              Email
            </Label>

            <Input
              id="settings-email"
              value={user.email ?? ""}
              disabled
            />

            <p className="text-xs text-muted-foreground">
              Use the email settings section to request an email change.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
