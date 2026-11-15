import { cn } from "@/lib/utils";

export function CrownMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("text-gold", className)} fill="none">
      <path
        d="M6 34 L9 14 L18 24 L24 8 L30 24 L39 14 L42 34 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="2.4" fill="currentColor" />
      <circle cx="24" cy="6" r="2.6" fill="currentColor" />
      <circle cx="39" cy="12" r="2.4" fill="currentColor" />
      <rect x="6" y="37" width="36" height="4" rx="1.5" fill="currentColor" />
      <path d="M24 16 L24 33" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="18" r="1.3" fill="var(--ink)" />
    </svg>
  );
}

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CrownMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-2xl font-semibold tracking-[0.18em]",
            tone === "light" ? "text-ink-foreground" : "text-foreground",
          )}
        >
          SARTAJ
        </span>
        <span
          className={cn(
            "mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.42em]",
            tone === "light" ? "text-gold" : "text-muted-foreground",
          )}
        >
          Sewing Machines
        </span>
      </span>
    </span>
  );
}
