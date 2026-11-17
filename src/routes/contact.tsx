import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { MapEmbed } from "@/components/site/MapEmbed";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { productsQuery } from "@/lib/queries";
import { directionsLink, formatPhone, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Contact & Location — Visit SARTAJ in Hariana, Punjab" },
      { name: "description", content: "Call 9855457616, WhatsApp 9878211338 or visit the SARTAJ sewing machine shop in Hariana, Punjab. Directions, hours and contact form." },
      { property: "og:title", content: "Contact SARTAJ" },
      { property: "og:description", content: "Phone, WhatsApp, email and directions to the SARTAJ showroom in Hariana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { contact } = useSettings();
  const { data: products } = useSuspenseQuery(productsQuery);
  const cards = [
    { Icon: Phone, label: "Call us", value: formatPhone(contact.phone), href: telLink(contact.phone) },
    { Icon: WhatsAppIcon, label: "WhatsApp", value: formatPhone(contact.whatsapp), href: whatsappLink(contact.whatsapp), external: true },
    { Icon: Mail, label: "Email", value: contact.email, href: mailtoLink(contact.email) },
    { Icon: MapPin, label: "Visit", value: contact.address, href: directionsLink(contact), external: true },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let's find your <em className="text-gradient-gold">perfect machine</em></>} subtitle="Reach out any way you like — or simply walk into our Hariana shop." image="/images/showroom.jpg" />
      <section className="relative mx-auto -mt-8 grid max-w-7xl grid-cols-2 gap-3 px-4 sm:gap-4 md:-mt-10 md:px-6 lg:grid-cols-4">
        {cards.map(({ Icon, label, value, href, external }) => (
          <a key={label} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group relative min-w-0 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-1 hover:border-gold sm:p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-gold sm:h-11 sm:w-11"><Icon className="h-5 w-5" /></span>
            <p className="eyebrow mt-3 text-[0.6rem] text-muted-foreground sm:mt-4">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold group-hover:text-gold [overflow-wrap:anywhere] sm:text-base">{value}</p>
          </a>
        ))}
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 md:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
        <div>
          <h2 className="mb-5 text-3xl md:mb-6 md:text-4xl">Send us a message</h2>
          <EnquiryForm products={products.map((p) => ({ id: p.id, name: p.name }))} defaultType="Shop Visit" />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl">Find the shop</h2>
          <MapEmbed contact={contact} className="h-[320px] md:h-[420px]" />
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
            <Clock className="h-5 w-5 shrink-0 text-gold" /> {contact.hours}
          </div>
          <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Open SARTAJ on Google Maps →
          </a>
        </div>
      </section>
    </>
  );
}
