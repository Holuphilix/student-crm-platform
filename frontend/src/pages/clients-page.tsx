import { useState } from "react";

import { Link } from "react-router-dom";
import { toast } from "sonner";

import { AvatarInitials } from "@/components/common/avatar-initials";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";

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
  const [searchQuery, setSearchQuery] = useState("");
  const filteredClients = (clients ?? []).filter((client) => {
    const query = searchQuery.trim().toLowerCase();

    return (
      !query ||
      [client.full_name, client.email, client.phone, client.company]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  });

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
        status: "new_lead",
      });

      toast.success(
        "Client created successfully."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
    } catch {
      toast.error(
        "Failed to create client."
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Manage and organize CRM client relationships."
      />

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Client Directory</CardTitle>
            <Input
              value={searchQuery}
              placeholder="Search clients..."
              aria-label="Search clients"
              className="sm:max-w-xs"
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading clients...</p>
          ) : filteredClients.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No clients match your current search.
            </p>
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

                  <TableHead>
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AvatarInitials
                          name={client.full_name}
                          email={client.email}
                          className="size-8"
                        />
                        {client.full_name}
                      </div>
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
                      <StatusBadge status={client.status} />
                    </TableCell>

                    <TableCell>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link
                          to={`/clients/${client.id}`}
                        >
                          View
                        </Link>
                      </Button>
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
