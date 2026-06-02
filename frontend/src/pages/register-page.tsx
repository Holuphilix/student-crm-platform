import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

import { useAuth } from "@/features/auth/hooks/use-auth";
import { PasswordInput } from "@/features/auth/components/password-input";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { PasswordStrengthMeter } from "@/features/auth/components/password-strength-meter";
import {
  getPasswordRules,
  isValidEmail,
} from "@/features/auth/utils/password-validation";

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRules = useMemo(
    () => getPasswordRules(password),
    [password]
  );

  const isPasswordStrong = passwordRules.every(
    (rule) => rule.isValid
  );

  const isEmailValid =
    !email || isValidEmail(email);

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
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

    setLoading(true);
    setError("");

    try {
      await signUp({
        fullName,
        email,
        password,
      });

      toast.success("Account created successfully.");
      navigate("/");
    } catch (registerError) {
      const nextError =
        registerError instanceof Error
          ? registerError.message
          : "Failed to create account.";

      setError(nextError);
      toast.error(nextError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Create CRM Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="full-name">
                Full Name
              </Label>

              <Input
                id="full-name"
                placeholder="Kenny James"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
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

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <PasswordInput
                id="password"
                placeholder="Create password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <PasswordRequirements
                rules={passwordRules}
              />

              <PasswordStrengthMeter
                rules={passwordRules}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm Password
              </Label>

              <PasswordInput
                id="confirm-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
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
                !isEmailValid ||
                !isPasswordStrong ||
                !passwordsMatch
              }
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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
