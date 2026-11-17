import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string | undefined;
  align?: "center" | "left" | undefined;
  tone?: "dark" | "light" | undefined;
  action?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "mb-8 flex flex-col gap-5 md:mb-12",
        align === "center" ? "items-center text-center" : "items-start text-left md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className={cn("eyebrow flex items-center gap-3 text-gold", align === "center" && "justify-center")}>
          <span className="h-px w-8 bg-gold" />
          {eyebrow}
        </p>
        <h2
          className={cn(
            "mt-3 text-[2rem] font-medium leading-[1.08] sm:text-4xl md:mt-4 md:text-5xl md:leading-[1.05]",
            tone === "light" ? "text-ink-foreground" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-3 text-[0.95rem] leading-relaxed md:mt-4 md:text-base", tone === "light" ? "text-ink-foreground/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </Reveal>
  );
}
