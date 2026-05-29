import type { Session, User } from "@supabase/supabase-js";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { UserProfile } from "@/features/auth/types/auth.types";
import { getRoleDisplayName } from "@/features/auth/utils/user-display";

type AccountMetadataCardProps = {
  user: User;
  session: Session | null;
  profile: UserProfile | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatUnixDate(value?: number) {
  if (!value) {
    return "Not available";
  }

  return formatDate(
    new Date(value * 1000).toISOString()
  );
}

export function AccountMetadataCard({
  user,
  session,
  profile,
}: AccountMetadataCardProps) {
  const metadataItems = [
    {
      label: "Account Created",
      value: formatDate(user.created_at),
    },
    {
      label: "Last Sign In",
      value: formatDate(user.last_sign_in_at),
    },
    {
      label: "Current Role",
      value: getRoleDisplayName(profile?.role ?? null),
    },
    {
      label: "Account Status",
      value: "Active",
    },
  ];

  const sessionItems = [
    {
      label: "Session Expiration",
      value: formatUnixDate(session?.expires_at),
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            Account Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Account status and access information.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {metadataItems.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 text-sm"
            >
              <span className="font-medium text-muted-foreground">
                {item.label}
              </span>
              <span className="break-all">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            Session
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current authenticated session information.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {sessionItems.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 text-sm"
            >
              <span className="font-medium text-muted-foreground">
                {item.label}
              </span>
              <span className="break-all">
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
