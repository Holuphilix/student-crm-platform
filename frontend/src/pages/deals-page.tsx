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

import { useClients } from "@/features/clients/hooks/use-clients";
import { PipelineBoard } from "@/features/deals/components/pipeline-board";
import { useCreateDeal } from "@/features/deals/hooks/use-deals";

export function DealsPage() {
  const { data: clients = [] } = useClients();
  const createDealMutation = useCreateDeal();

  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [valueAmount, setValueAmount] = useState("");
  const [expectedIntake, setExpectedIntake] =
    useState("");

  async function handleCreateDeal(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!clientId || !title) {
      toast.error("Client and deal title are required.");
      return;
    }

    const parsedValue = valueAmount
      ? Number(valueAmount)
      : undefined;

    if (
      parsedValue !== undefined &&
      Number.isNaN(parsedValue)
    ) {
      toast.error("Deal value must be a valid number.");
      return;
    }

    try {
      await createDealMutation.mutateAsync({
        client_id: clientId,
        title,
        value_amount: parsedValue,
        expected_intake:
          expectedIntake.trim() || undefined,
      });

      toast.success("Deal created.");
      setClientId("");
      setTitle("");
      setValueAmount("");
      setExpectedIntake("");
    } catch {
      toast.error("Failed to create deal.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Deal Pipeline
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Track clients across each pipeline stage.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Create Deal
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleCreateDeal}
            className="grid gap-4 md:grid-cols-2"
          >
            <select
              value={clientId}
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
              onChange={(event) =>
                setClientId(event.target.value)
              }
            >
              <option value="">
                Select client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.full_name}
                </option>
              ))}
            </select>

            <Input
              value={title}
              placeholder="Deal title"
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />

            <Input
              value={valueAmount}
              type="number"
              min="0"
              placeholder="Deal value"
              onChange={(event) =>
                setValueAmount(event.target.value)
              }
            />

            <Input
              value={expectedIntake}
              placeholder="Expected intake"
              onChange={(event) =>
                setExpectedIntake(event.target.value)
              }
            />

            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={
                  createDealMutation.isPending
                }
              >
                {createDealMutation.isPending
                  ? "Creating..."
                  : "Create Deal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PipelineBoard />
    </div>
  );
}
