import { createFileRoute, Link } from "@tanstack/react-router";
import { Cog, Gauge, Hammer, Package, Settings2, Sparkles, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { formatPhone, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Sewing Machine Repair & Service in Hariana | SARTAJ" },
      { name: "description", content: "Expert repair, servicing, servo motor conversion and industrial setup for domestic and industrial sewing machines of all brands at SARTAJ, Hariana." },
      { property: "og:title", content: "SARTAJ Repair & Maintenance" },
      { property: "og:description", content: "Honest diagnosis, skilled repair and genuine-fit spare parts for every sewing machine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { Icon: Wrench, title: "General repair", body: "Skipped stitches, thread breaking, jamming, noise — diagnosed and fixed properly." },
  { Icon: Sparkles, title: "Cleaning & oiling", body: "Full servicing: dust removal, lubrication and tension tuning for smooth running." },
  { Icon: Gauge, title: "Timing & hook setting", body: "Precision adjustment of needle timing, hook, feed dog and presser foot." },
  { Icon: Zap, title: "Servo motor conversion", body: "Swap noisy clutch motors for silent, power-saving servo motors." },
  { Icon: Settings2, title: "Industrial installation", body: "Table, motor and head assembly with alignment and test stitching." },
  { Icon: Package, title: "Spare part replacement", body: "Genuine-fit hooks, bobbin cases, feet, belts and more — fitted on the spot." },
  { Icon: Hammer, title: "Old machine restoration", body: "Bring a family heirloom machine back to life with careful restoration." },
  { Icon: Cog, title: "Annual maintenance", body: "Planned servicing for boutiques and garment units to avoid downtime." },
];

const STEPS = [
  ["Contact us", "Call, WhatsApp a photo or video of the problem, or send an enquiry."],
  ["Bring it in", "Visit our Hariana workshop. For industrial units, we'll advise on the best plan."],
  ["Honest diagnosis", "We explain what's wrong and what it needs — before any work starts."],
  ["Repair & test", "Skilled repair with genuine-fit parts, then test stitching on your fabric."],
];

function ServicesPage() {
  const { contact } = useSettings();
  return (
    <>
      <PageHero eyebrow="Repair & Service" title={<>Expert care for <em className="text-gradient-gold">every machine</em></>} subtitle="Domestic and industrial, every brand — repaired by technicians who have spent years inside sewing machines." image="/images/repair-service.jpg" />
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <SectionHeading eyebrow="What we do" title="Services at the SARTAJ workshop" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.04}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-gold transition-transform group-hover:rotate-6"><Icon className="h-6 w-6" /></span>
                <h2 className="mt-5 text-xl">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="grain bg-gradient-ink py-24 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading tone="light" eyebrow="How it works" title="Simple, transparent service" />
          <ol className="grid gap-5 md:grid-cols-4">
            {STEPS.map(([t, b], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="glass-ink h-full rounded-2xl p-6">
                  <span className="font-display text-5xl text-gradient-gold">0{i + 1}</span>
                  <h3 className="mt-4 text-xl">{t}</h3>
                  <p className="mt-2 text-sm text-ink-foreground/70">{b}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="xl"><Link to="/enquire" search={{ type: "Repair & Service" }}>Book a Service</Link></Button>
            <Button asChild variant="whatsapp" size="xl"><a href={whatsappLink(contact.whatsapp, "Hello SARTAJ, I need my sewing machine serviced.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4" /> WhatsApp {formatPhone(contact.whatsapp)}</a></Button>
            <Button asChild variant="outline-gold" size="xl"><a href={telLink(contact.phone)}>Call {formatPhone(contact.phone)}</a></Button>
          </div>
        </div>
      </section>
    </>
  );
}
