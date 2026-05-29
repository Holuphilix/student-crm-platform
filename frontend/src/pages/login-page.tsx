import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { PasswordInput } from "@/features/auth/components/password-input";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { isValidEmail } from "@/features/auth/utils/password-validation";

const rememberMeStorageKey =
  "student-crm-remember-me";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () =>
      window.localStorage.getItem(
        rememberMeStorageKey
      ) === "true"
  );
  const [hasSubmitted, setHasSubmitted] =
    useState(false);
  const [isCapsLockOn, setIsCapsLockOn] =
    useState(false);
  const [error, setError] = useState("");

  const emailValidationMessage = !email
    ? "Email is required."
    : !isValidEmail(email)
      ? "Invalid email format."
      : "";

  const passwordValidationMessage = !password
    ? "Password is required."
    : password.length < 8
      ? "Password must be at least 8 characters."
      : "";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setHasSubmitted(true);
    setLoading(true);
    setError("");

    if (
      emailValidationMessage ||
      passwordValidationMessage
    ) {
      setLoading(false);
      return;
    }

    try {
      await signIn({
        email,
        password,
      });

      window.localStorage.setItem(
        rememberMeStorageKey,
        String(rememberMe)
      );
      toast.success("Login successful. Welcome back.");

      const redirectTo =
        (
          location.state as
            | { from?: { pathname?: string } }
            | null
        )?.from?.pathname ?? "/";

      navigate(redirectTo, {
        replace: true,
      });
    } catch {
      const nextError = "Invalid email or password.";

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
            Student CRM Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
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

              {hasSubmitted &&
                emailValidationMessage && (
                  <p className="text-sm text-destructive">
                    {emailValidationMessage}
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">
                  Password
                </Label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <PasswordInput
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onKeyDown={(event) =>
                  setIsCapsLockOn(
                    event.getModifierState("CapsLock")
                  )
                }
                onKeyUp={(event) =>
                  setIsCapsLockOn(
                    event.getModifierState("CapsLock")
                  )
                }
                onBlur={() => setIsCapsLockOn(false)}
                required
              />

              {isCapsLockOn && (
                <p className="text-sm text-destructive">
                  Caps Lock is on
                </p>
              )}

              {hasSubmitted &&
                passwordValidationMessage && (
                  <p className="text-sm text-destructive">
                    {passwordValidationMessage}
                  </p>
                )}

            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                className="h-4 w-4 rounded border border-input"
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <Label
                htmlFor="remember-me"
                className="text-sm font-normal text-muted-foreground"
              >
                Remember Me
              </Label>
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              to="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
