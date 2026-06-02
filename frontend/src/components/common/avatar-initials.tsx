import { cn } from "@/lib/utils";

type AvatarInitialsProps = {
  name?: string | null;
  email?: string | null;
  className?: string;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const words = source.split(/[\s@._-]+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function AvatarInitials({
  name,
  email,
  className,
}: AvatarInitialsProps) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
        className
      )}
      aria-label={name || email || "User"}
    >
      {getInitials(name, email)}
    </div>
  );
}
