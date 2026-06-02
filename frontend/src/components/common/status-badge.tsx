import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  new_lead: "border-slate-200 bg-slate-50 text-slate-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  consultation_booked: "border-violet-200 bg-violet-50 text-violet-700",
  documents_requested: "border-orange-200 bg-orange-50 text-orange-700",
  application_started: "border-yellow-200 bg-yellow-50 text-yellow-800",
  submitted: "border-cyan-200 bg-cyan-50 text-cyan-700",
  won: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-red-200 bg-red-50 text-red-700",
  open: "border-blue-200 bg-blue-50 text-blue-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  closed: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map(
      (word) =>
        `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    )
    .join(" ");
}

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
    "whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize shadow-xs",
        statusStyles[status],
        className
      )}
    >
      {formatStatusLabel(status)}
    </Badge>
  );
}
