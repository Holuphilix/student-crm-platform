import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpenCheck,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,var(--background)_0%,oklch(0.96_0.025_258)_46%,oklch(0.985_0.01_190)_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 size-80 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden rounded-lg border bg-card/90 p-8 shadow-[0_28px_70px_-46px_rgba(15,23,42,0.75)] backdrop-blur lg:block">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                Student CRM Platform
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Education sales management, organized.
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
            Manage student leads, conversations, applications, and sales follow-up from one secure CRM workspace.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              {
                icon: Users,
                title: "Role-aware portals",
                text: "Admin, Sales, and Client users see the workflows that matter to them.",
              },
              {
                icon: MessageSquare,
                title: "Conversation tracking",
                text: "Assign, reply, and keep client communication tied to CRM records.",
              },
              {
                icon: BookOpenCheck,
                title: "Application pipeline",
                text: "Follow each opportunity from lead through submission and outcome.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-lg border bg-background/70 p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Card className="relative mx-auto w-full max-w-md shadow-[0_24px_70px_-42px_rgba(15,23,42,0.75)]">
          <CardHeader className="gap-3 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Welcome back
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to manage your Student CRM workspace.
              </p>
            </div>
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

            <div className="flex items-center justify-between gap-3">
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
    </div>
  );
}
