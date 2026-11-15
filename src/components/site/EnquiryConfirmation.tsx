import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "./FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { directionsLink, formatPhone, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export type EnquirySummary = {
  reference: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  productName: string;
  enquiryType: string;
  message: string;
};

export function EnquiryConfirmation({ summary, onReset }: { summary: EnquirySummary; onReset?: () => void }) {
  const { contact } = useSettings();
  const text = [
    `Hello SARTAJ, my enquiry reference is ${summary.reference}.`,
    summary.productName ? `Product: ${summary.productName}` : "",
    `Type: ${summary.enquiryType}`,
    `Name: ${summary.name} (${summary.city})`,
    summary.message ? `Message: ${summary.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const rows: [string, string][] = [
    ["Reference", summary.reference],
    ["Product", summary.productName || "General enquiry"],
    ["Enquiry type", summary.enquiryType],
    ["Name", summary.name],
    ["Phone", formatPhone(summary.phone)],
    ...(summary.email ? ([["Email", summary.email]] as [string, string][]) : []),
    ["City / Location", summary.city],
    ["Submitted", new Date(summary.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-border bg-card p-6 shadow-lift md:p-10"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-gold text-gold-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-3xl font-medium">Thank you, {summary.name.split(" ")[0]}!</h2>
          <p className="mt-2 text-muted-foreground">
            Your enquiry has been received. Our team will contact you shortly. Products are purchased in person — we'd love to welcome you at the shop.
          </p>
        </div>
      </div>

      <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="bg-card px-4 py-3">
            <dt className="eyebrow text-[0.6rem] text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-sm font-semibold">{v}</dd>
          </div>
        ))}
        {summary.message && (
          <div className="bg-card px-4 py-3 sm:col-span-2">
            <dt className="eyebrow text-[0.6rem] text-muted-foreground">Message</dt>
            <dd className="mt-1 whitespace-pre-line text-sm">{summary.message}</dd>
          </div>
        )}
      </dl>

      <p className="eyebrow mt-8 text-gold">Reach us faster</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="ink" size="xl">
          <a href={telLink(contact.phone)}><Phone /> Call {formatPhone(contact.phone)}</a>
        </Button>
        <Button asChild variant="whatsapp" size="xl">
          <a href={whatsappLink(contact.whatsapp, text)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp {formatPhone(contact.whatsapp)}
          </a>
        </Button>
        <Button asChild variant="outline-ink" size="xl">
          <a href={mailtoLink(contact.email, `Enquiry ${summary.reference}`, text)}><Mail /> Email us</a>
        </Button>
        <Button asChild variant="gold" size="xl">
          <a href={directionsLink(contact)} target="_blank" rel="noopener noreferrer"><MapPin /> Visit Store — Directions</a>
        </Button>
      </div>
      {onReset && (
        <button type="button" onClick={onReset} className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline">
          Send another enquiry
        </button>
      )}
    </motion.div>
  );
}
