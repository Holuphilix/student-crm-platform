import { Link, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { ClientActivityTimeline } from "@/features/clients/components/client-activity-timeline";
import { ClientConversationsSection } from "@/features/clients/components/client-conversations-section";
import { ClientDealsSection } from "@/features/clients/components/client-deals-section";
import { ClientProfileCard } from "@/features/clients/components/client-profile-card";
import { useClientDetail } from "@/features/clients/hooks/use-clients";

export function ClientDetailPage() {
  const { clientId } = useParams<{
    clientId: string;
  }>();

  const {
    data: clientDetail,
    isLoading,
    isError,
  } = useClientDetail(clientId);

  if (!clientId) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-destructive">
            Client id is missing.
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
          <Link to="/clients">
            <ArrowLeft />
            Clients
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            Client Relationship Workspace
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage conversations, deals, and client activity.
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
          <Skeleton className="h-96 w-full" />
        </div>
      ) : isError || !clientDetail ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Failed to load client detail.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <ClientProfileCard
            client={clientDetail.client}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <ClientConversationsSection
              conversations={
                clientDetail.conversations
              }
            />

            <ClientDealsSection
              deals={clientDetail.deals}
            />
          </div>

          <ClientActivityTimeline
            activities={
              clientDetail.activityTimeline
            }
          />
        </div>
      )}
    </div>
  );
}
