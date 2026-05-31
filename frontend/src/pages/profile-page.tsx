import { useEffect, useMemo, useState } from "react";

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

import {
  useClients,
  useUpdateClient,
} from "@/features/clients/hooks/use-clients";

export function ProfilePage() {
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useClients();
  const updateClientMutation = useUpdateClient();

  const client = useMemo(
    () => clients[0] ?? null,
    [clients]
  );

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [targetCountry, setTargetCountry] =
    useState("");

  useEffect(() => {
    if (!client) {
      return;
    }

    setFullName(client.full_name ?? "");
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setCountry(client.country ?? "");
    setTargetCountry(client.target_country ?? "");
  }, [client]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!client) {
      toast.error("Client profile was not found.");
      return;
    }

    try {
      await updateClientMutation.mutateAsync({
        clientId: client.id,
        payload: {
          full_name: fullName,
          email,
          phone: phone || null,
          country: country || null,
          target_country: targetCountry || null,
        },
      });

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading profile...
      </p>
    );
  }

  if (isError || !client) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Profile
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Keep your student application details up to date for the CRM team.
          </p>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">
              Your client profile is being prepared.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Refresh in a moment or contact the CRM team if this account was created before the client portal was enabled.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Profile
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep your student application details up to date for the CRM team.
        </p>
      </div>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>
            Client Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="client-full-name">
                Full Name
              </Label>
              <Input
                id="client-full-name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">
                Email
              </Label>
              <Input
                id="client-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">
                Phone
              </Label>
              <Input
                id="client-phone"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-country">
                Country
              </Label>
              <Input
                id="client-country"
                value={country}
                onChange={(event) =>
                  setCountry(event.target.value)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="client-target-country">
                Target Country
              </Label>
              <Input
                id="client-target-country"
                value={targetCountry}
                onChange={(event) =>
                  setTargetCountry(event.target.value)
                }
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={
                  updateClientMutation.isPending
                }
              >
                {updateClientMutation.isPending
                  ? "Saving..."
                  : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
