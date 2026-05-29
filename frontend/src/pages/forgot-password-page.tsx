import { useState } from "react";
import { Link } from "react-router-dom";
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

import { requestPasswordRecovery } from "@/features/auth/services/auth.service";
import { isValidEmail } from "@/features/auth/utils/password-validation";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] =
    useState(false);
  const isEmailValid =
    !email || isValidEmail(email);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setIsSubmitted(false);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      await requestPasswordRecovery({
        email,
      });

      setIsSubmitted(true);
      toast.success("Password reset email sent.");
    } catch (recoveryError) {
      const nextError =
        recoveryError instanceof Error
          ? recoveryError.message
          : "Failed to send reset email.";

      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Reset Password
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="recovery-email">
                Email
              </Label>

              <Input
                id="recovery-email"
                type="email"
                placeholder="you@example.com"
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

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {isSubmitted && (
              <p className="text-sm text-muted-foreground">
                If an account exists for this email, a password reset link has been sent.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isEmailValid}
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
