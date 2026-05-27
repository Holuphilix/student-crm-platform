import { useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useClients,
  useCreateClient,
} from "@/features/clients/hooks/use-clients";

export function ClientsPage() {
  const { data: clients, isLoading } = useClients();

  const createClientMutation = useCreateClient();

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [company, setCompany] = useState("");

  async function handleCreateClient(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fullName || !email) {
      toast.error(
        "Full name and email are required."
      );

      return;
    }

    try {
      await createClientMutation.mutateAsync({
        full_name: fullName,
        email,
        phone,
        company,
        status: "lead",
      });

      toast.success(
        "Client created successfully."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
    } catch (error) {
      toast.error(
        "Failed to create client."
      );
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Create Client
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleCreateClient}
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />

            <Input
              placeholder="Phone"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
            />

            <Input
              placeholder="Company"
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
            />

            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending
                  ? "Creating..."
                  : "Create Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Clients
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading clients...</p>
          ) : clients?.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Name
                  </TableHead>

                  <TableHead>
                    Email
                  </TableHead>

                  <TableHead>
                    Phone
                  </TableHead>

                  <TableHead>
                    Company
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      {client.full_name}
                    </TableCell>

                    <TableCell>
                      {client.email}
                    </TableCell>

                    <TableCell>
                      {client.phone}
                    </TableCell>

                    <TableCell>
                      {client.company}
                    </TableCell>

                    <TableCell>
                      <Badge>
                        {client.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}