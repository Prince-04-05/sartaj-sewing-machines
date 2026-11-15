import { cn } from "@/lib/utils";
import { CrownMark } from "./Logo";

/** Product image with a tasteful SARTAJ label in the corner, kept clear of machine details. */
export function BrandedImage({
  src,
  alt,
  className,
  imgClassName,
  eager,
  badge = true,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  badge?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      <img
        src={src || "/images/showroom.jpg"}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={cn("h-full w-full object-cover", imgClassName)}
      />
      {badge && (
        <span className="glass-ink pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.28em] text-ink-foreground">
          <CrownMark className="h-3.5 w-3.5" />
          SARTAJ
        </span>
      )}
    </div>
  );
}
