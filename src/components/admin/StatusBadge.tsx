import { cn } from "@/lib/utils";

export const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "visit_scheduled", label: "Visit scheduled" },
  { value: "closed", label: "Closed" },
] as const;

export type EnquiryStatus = (typeof STATUSES)[number]["value"];

export function StatusBadge({ status }: { status: string }) {
  const label = STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "new" && "bg-gradient-gold text-gold-foreground",
        status === "contacted" && "bg-ink text-ink-foreground",
        status === "visit_scheduled" && "bg-success text-primary-foreground",
        status === "closed" && "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
