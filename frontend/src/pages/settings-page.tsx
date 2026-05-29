import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { AccountMetadataCard } from "@/features/settings/components/account-metadata-card";
import { EmailSettingsCard } from "@/features/settings/components/email-settings-card";
import { PasswordSettingsCard } from "@/features/settings/components/password-settings-card";
import { ProfileSettingsCard } from "@/features/settings/components/profile-settings-card";

export function SettingsPage() {
  const {
    user,
    session,
    profile,
  } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">
            You must be signed in to manage settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Account Settings
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your profile, session, and account identity.
        </p>
      </div>

      <ProfileSettingsCard
        user={user}
        profile={profile}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <EmailSettingsCard user={user} />

        <PasswordSettingsCard />
      </div>

      <AccountMetadataCard
        user={user}
        session={session}
        profile={profile}
      />
    </div>
  );
}
