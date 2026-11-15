import { mapEmbedSrc, type ContactSettings } from "@/lib/site";
import { cn } from "@/lib/utils";

export function MapEmbed({ contact, className }: { contact: ContactSettings; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-secondary", className)}>
      <iframe
        title="SARTAJ Sewing Machine on Google Maps"
        src={mapEmbedSrc(contact)}
        className="h-full min-h-[320px] w-full grayscale-[35%] contrast-[1.05]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
