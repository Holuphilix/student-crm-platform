import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useCreateUser } from "@/features/users/hooks/use-users";
import type { CrmUser } from "@/features/users/types/user.types";

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "user",
    label: "Client",
  },
] as const;

export function CreateUserCard() {
  const createUserMutation = useCreateUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<CrmUser["role"]>("sales");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      await createUserMutation.mutateAsync({
        full_name: fullName,
        email,
        password,
        role,
      });

      toast.success("User created successfully.");
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("sales");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create user."
      );
    }
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 md:grid-cols-2"
        >
          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(event) =>
              setFullName(event.target.value)
            }
          />

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />

          <select
            value={role}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              setRole(event.target.value as CrmUser["role"])
            }
          >
            {roleOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending
                ? "Creating..."
                : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
