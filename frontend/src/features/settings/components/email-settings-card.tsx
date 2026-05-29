import { useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateAuthenticatedEmail } from "@/features/auth/services/auth.service";
import { isValidEmail } from "@/features/auth/utils/password-validation";

type EmailSettingsCardProps = {
  user: User;
};

export function EmailSettingsCard({
  user,
}: EmailSettingsCardProps) {
  const [email, setEmail] = useState(user.email ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isEmailValid =
    !email || isValidEmail(email);

  useEffect(() => {
    setEmail(user.email ?? "");
  }, [user.email]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setMessage("");
    setError("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSaving(true);

    try {
      await updateAuthenticatedEmail({
        email,
      });

      setMessage(
        "Email update requested. Check your inbox to confirm the new email address."
      );
      toast.success("Email update request sent.");
    } catch (updateError) {
      const nextError =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update email.";

      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          Email
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Update the email used for login and account notifications.
        </p>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="settings-email-update">
              Email
            </Label>

            <Input
              id="settings-email-update"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            {!isEmailValid && (
              <p className="text-sm text-destructive">
                Enter a valid email address.
              </p>
            )}
          </div>

          {message && (
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={
              isSaving ||
              email === (user.email ?? "") ||
              !isEmailValid
            }
          >
            {isSaving
              ? "Updating Email..."
              : "Update Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
