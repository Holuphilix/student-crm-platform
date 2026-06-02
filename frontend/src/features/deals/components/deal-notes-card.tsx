import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { DealNote } from "@/features/deals/types/deal.types";

type DealNotesCardProps = {
  notes: DealNote[];
};

const noteDateFormatter = new Intl.DateTimeFormat(
  undefined,
  {
    dateStyle: "medium",
    timeStyle: "short",
  }
);

export function DealNotesCard({
  notes,
}: DealNotesCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            Internal Notes
          </CardTitle>

          <Badge variant="secondary">
            {notes.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-3"
              >
                <p className="whitespace-pre-wrap break-words text-sm">
                  {note.body}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {noteDateFormatter.format(
                    new Date(note.created_at)
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No internal notes recorded for this deal.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
