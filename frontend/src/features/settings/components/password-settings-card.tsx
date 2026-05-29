import { useMemo, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { updateAuthenticatedPassword } from "@/features/auth/services/auth.service";
import { getPasswordRules } from "@/features/auth/utils/password-validation";

export function PasswordSettingsCard() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordRules = useMemo(
    () => getPasswordRules(password),
    [password]
  );

  const isPasswordValid = passwordRules.every(
    (rule) => rule.isValid
  );

  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setMessage("");
    setError("");

    if (!isPasswordValid || !passwordsMatch) {
      setError(
        "Password does not meet all requirements."
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateAuthenticatedPassword({
        password,
      });

      setPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
      toast.success("Password updated successfully.");
    } catch (updateError) {
      const nextError =
        updateError instanceof Error
          ? updateError.message
          : "Failed to update password.";

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
          Password
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Set a strong password for your CRM account.
        </p>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="settings-password">
                New Password
              </Label>

              <PasswordInput
                id="settings-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-confirm-password">
                Confirm Password
              </Label>

              <PasswordInput
                id="settings-confirm-password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <PasswordRequirements
              rules={passwordRules}
            />

            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-destructive">
                Passwords must match.
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
              !isPasswordValid ||
              !passwordsMatch
            }
          >
            {isSaving
              ? "Updating Password..."
              : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
