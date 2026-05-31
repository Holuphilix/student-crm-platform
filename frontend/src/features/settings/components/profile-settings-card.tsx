import { useEffect, useMemo, useState } from "react";

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

import { useAuth } from "@/features/auth/hooks/use-auth";
import type { UserProfile } from "@/features/auth/types/auth.types";
import {
  getFriendlyDisplayName,
  getRoleDisplayName,
} from "@/features/auth/utils/user-display";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const { updateProfile } = useAuth();
  const isSales = profile?.role === "sales";
  const fullName = useMemo(
    () =>
      getFriendlyDisplayName({
        full_name: getUserFullName(profile),
        email: profile?.email ?? user.email,
        fallback: "User",
      }),
    [profile, user.email]
  );
  const [editableFullName, setEditableFullName] =
    useState(fullName);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditableFullName(fullName);
    setPhone(profile?.phone ?? "");
  }, [fullName, profile?.phone]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isSales || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName: editableFullName,
        phone,
      });
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

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
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2">
            <Label htmlFor="settings-full-name">
              Full Name
            </Label>

            <Input
              id="settings-full-name"
              value={
                isSales ? editableFullName : fullName
              }
              disabled={!isSales}
              onChange={(event) =>
                setEditableFullName(event.target.value)
              }
            />

            <p className="text-xs text-muted-foreground">
              {isSales
                ? "Update your displayed CRM identity."
                : "Full name is managed by your organization."}
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

          {isSales ? (
            <div className="space-y-2">
              <Label htmlFor="settings-phone">
                Phone
              </Label>

              <Input
                id="settings-phone"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />
            </div>
          ) : null}

          {isSales ? (
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
