import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import {
  signOutUser,
  updateAuthenticatedPassword,
} from "@/features/auth/services/auth.service";
import { getPasswordRules } from "@/features/auth/utils/password-validation";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const passwordRules = useMemo(
    () => getPasswordRules(password),
    [password]
  );

  const isPasswordStrong = passwordRules.every(
    (rule) => rule.isValid
  );

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  useEffect(() => {
    if (!loading && !session) {
      setError(
        "Password recovery session is missing or expired. Request a new reset link."
      );
    }
  }, [loading, session]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!session) {
      setError(
        "Password recovery session is missing or expired. Request a new reset link."
      );
      return;
    }

    if (!isPasswordStrong) {
      setError(
        "Password must meet all requirements."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateAuthenticatedPassword({
        password,
      });
      await signOutUser();
      toast.success("Password updated successfully.");

      navigate("/login", {
        replace: true,
      });
    } catch (resetError) {
      const nextError =
        resetError instanceof Error
          ? resetError.message
          : "Failed to update password.";

      setError(nextError);
      toast.error(nextError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Create New Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="new-password">
                New Password
              </Label>

              <PasswordInput
                id="new-password"
                placeholder="Enter new password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <PasswordRequirements
                rules={passwordRules}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">
                Confirm Password
              </Label>

              <PasswordInput
                id="confirm-new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />

              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">
                  Passwords must match.
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                isSaving ||
                !session ||
                !isPasswordStrong ||
                !passwordsMatch
              }
            >
              {isSaving
                ? "Updating Password..."
                : "Update Password"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Need a new link?{" "}
            <Link
              to="/forgot-password"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Request reset
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
