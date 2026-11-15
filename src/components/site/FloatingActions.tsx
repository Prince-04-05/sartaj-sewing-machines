import { useEffect, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { telLink, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43a9.38 9.38 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43M20.07 3.92A11.3 11.3 0 0 0 12.04.6C5.79.6.7 5.68.7 11.94c0 2 .52 3.95 1.52 5.67L.6 23.4l5.94-1.56a11.3 11.3 0 0 0 5.5 1.4c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.31-8.02" />
    </svg>
  );
}

export function FloatingActions() {
  const { contact } = useSettings();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-6">
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:border-gold",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <a
        href={telLink(contact.phone)}
        aria-label={`Call SARTAJ on ${contact.phone}`}
        className="grid h-13 w-13 place-items-center rounded-full bg-ink text-gold shadow-lift transition-transform hover:scale-105"
        style={{ height: 52, width: 52 }}
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={whatsappLink(contact.whatsapp, "Hello SARTAJ, I would like to know more about your sewing machines.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with SARTAJ on WhatsApp"
        className="relative grid place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lift transition-transform hover:scale-105"
        style={{ height: 56, width: 56 }}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-25" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </a>
    </div>
  );
}
