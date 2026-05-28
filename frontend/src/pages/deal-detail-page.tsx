import { Link, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ActivityFeed } from "@/features/deals/components/activity-feed";
import { DealNotesCard } from "@/features/deals/components/deal-notes-card";
import { NoteInput } from "@/features/deals/components/note-input";
import {
  useCreateDealNote,
  useDealDetail,
} from "@/features/deals/hooks/use-deal-notes";

const currencyFormatter = new Intl.NumberFormat(
  undefined,
  {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }
);

export function DealDetailPage() {
  const { dealId } = useParams<{
    dealId: string;
  }>();

  const {
    data: dealDetail,
    isLoading,
    isError,
  } = useDealDetail(dealId);

  const createNoteMutation = useCreateDealNote(dealId);

  async function handleSubmitNote(body: string) {
    if (!dealId) {
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        body,
      });

      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    }
  }

  if (!dealId) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">
            Deal id is missing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          asChild
          variant="ghost"
          className="px-0"
        >
          <Link to="/deals">
            <ArrowLeft />
            Deals
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            Deal Workspace
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage notes, activity, and relationship progress.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 xl:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      ) : isError || !dealDetail ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Failed to load deal detail.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-xl">
                    {dealDetail.deal.title}
                  </CardTitle>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {dealDetail.deal.clients?.full_name ??
                      "No client linked"}
                  </p>
                </div>

                <Badge className="capitalize">
                  {dealDetail.deal.stage}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Value
                </p>
                <p className="mt-1 text-sm">
                  {dealDetail.deal.value_amount
                    ? currencyFormatter.format(
                        dealDetail.deal.value_amount
                      )
                    : "No value set"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Expected Intake
                </p>
                <p className="mt-1 text-sm">
                  {dealDetail.deal.expected_intake ||
                    "Not set"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Company
                </p>
                <p className="mt-1 text-sm">
                  {dealDetail.deal.clients?.company ||
                    "No company"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>
                Add Note
              </CardTitle>
            </CardHeader>

            <CardContent>
              <NoteInput
                isSubmitting={
                  createNoteMutation.isPending
                }
                onSubmitNote={handleSubmitNote}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <DealNotesCard notes={dealDetail.notes} />

            <ActivityFeed
              activities={dealDetail.activityFeed}
            />
          </div>
        </div>
      )}
    </div>
  );
}
