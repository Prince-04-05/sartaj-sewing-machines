import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { WhyChoose, Testimonials } from "@/components/home/Sections";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { homeQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SARTAJ — Sewing Machine Specialists in Hariana, Punjab" },
      { name: "description", content: "SARTAJ is a sewing machine shop in Hariana, Punjab offering machines, motors, spare parts and repair with honest, expert advice." },
      { property: "og:title", content: "About SARTAJ" },
      { property: "og:description", content: "The story and values behind SARTAJ Sewing Machines, Hariana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { content } = useSettings();
  const { data } = useQuery(homeQuery);
  return (
    <>
      <PageHero eyebrow="About us" title={<>The meaning of <em className="text-gradient-gold">Sartaj</em></>} subtitle="‘Sartaj’ means crown — a promise to offer the very best in sewing machines and service." image="/images/hero-machine.jpg" />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-16 md:px-6 md:py-24 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <h2 className="text-[2rem] leading-tight sm:text-4xl md:text-5xl">{content.aboutTitle}</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">{content.aboutBody}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We believe buying a sewing machine should be personal. That's why every sale happens at our shop — so you can see the machine run, feel the stitch quality, and leave with exactly what your work needs. After the sale, we stay with you for servicing, parts and advice.
          </p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Button asChild variant="ink" size="xl"><Link to="/products">See our range <ArrowRight /></Link></Button>
            <Button asChild variant="outline-ink" size="xl"><Link to="/contact">Visit us</Link></Button>
          </div>
        </Reveal>
        <Reveal className="relative">
          <img src="/images/showroom.jpg" alt="Inside the SARTAJ showroom" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lift md:rounded-3xl" />
          <div className="glass absolute -bottom-8 left-3 right-3 grid grid-cols-3 gap-2 rounded-2xl p-3 text-center shadow-soft sm:left-6 sm:right-6 sm:gap-4 sm:p-5">
            {[["Home", "Tailors"], ["Boutique", "Owners"], ["Garment", "Units"]].map(([a, b]) => (
              <div key={a} className="min-w-0"><p className="truncate font-display text-lg sm:text-2xl">{a}</p><p className="text-xs text-muted-foreground">{b}</p></div>
            ))}
          </div>
        </Reveal>
      </section>
      <WhyChoose />
      {data && <Testimonials items={data.testimonials} />}
    </>
  );
}
