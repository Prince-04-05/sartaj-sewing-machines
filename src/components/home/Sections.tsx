import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Cog, HandHeart, Headphones, MapPin, Quote, Star, Truck, Wrench, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { MapEmbed } from "@/components/site/MapEmbed";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { directionsLink, formatPhone, telLink, whatsappLink, type CategoryDTO, type ProductDTO } from "@/lib/site";

export function CategoryMarquee({ categories }: { categories: CategoryDTO[] }) {
  const items = [...categories, ...categories];
  return (
    <div className="relative overflow-hidden border-y border-border bg-card py-4 md:py-5" aria-hidden="true">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {items.map((c, i) => (
          <span key={`${c.id}-${i}`} className="flex items-center gap-10 font-display text-lg text-foreground/70 md:text-xl">
            {c.name}
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryGrid({ categories }: { categories: CategoryDTO[] }) {
  const top = categories.slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading
        eyebrow="Shop by category"
        title={<>Everything for the <em className="text-gradient-gold">craft of sewing</em></>}
        subtitle="From home machines to complete industrial setups — and every motor, belt, needle and bobbin in between."
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {top.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05} className={i === 0 || i === 5 ? "lg:row-span-2" : ""}>
            <Link
              to="/products"
              search={{ category: c.slug }}
              className="group relative block h-full min-h-[170px] overflow-hidden rounded-2xl bg-ink sm:min-h-[220px]"
            >
              <img
                src={c.image_url ?? "/images/showroom.jpg"}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="relative flex h-full min-h-[170px] flex-col justify-end p-4 text-ink-foreground sm:min-h-[220px] sm:p-5">
                <p className="eyebrow truncate text-[0.55rem] tracking-[0.2em] text-gold sm:text-[0.58rem] sm:tracking-[0.28em]">{c.group_name}</p>
                <h3 className="mt-1 text-base leading-tight sm:text-xl lg:text-2xl">{c.name}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-ink-foreground/70 sm:mt-3 transition-all group-hover:gap-2 group-hover:text-gold">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-8 text-center md:mt-10">
        <Button asChild variant="outline-ink" size="xl" className="w-full sm:w-auto">
          <Link to="/products">View all {categories.length} categories <ArrowRight /></Link>
        </Button>
      </div>
    </section>
  );
}

function useAutoplay(api: CarouselApi | undefined, ms = 4500) {
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      api.scrollNext();
    }, ms);
    return () => clearInterval(id);
  }, [api, ms]);
}

export function ProductSlider({
  eyebrow,
  title,
  subtitle,
  products,
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string | undefined;
  products: ProductDTO[];
  tone?: "light" | "dark" | undefined;
}) {
  const [api, setApi] = useState<CarouselApi>();
  useAutoplay(api, 5000);
  if (!products.length) return null;
  const dark = tone === "dark";
  return (
    <section className={dark ? "grain relative bg-gradient-ink py-16 text-ink-foreground md:py-24" : "py-16 md:py-24"}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          align="left"
          tone={dark ? "light" : "dark"}
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          action={
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => api?.scrollPrev()} aria-label="Previous" className={`grid h-11 w-11 place-items-center rounded-full border transition-colors hover:border-gold hover:text-gold ${dark ? "border-ink-foreground/20" : "border-border"}`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => api?.scrollNext()} aria-label="Next" className={`grid h-11 w-11 place-items-center rounded-full border transition-colors hover:border-gold hover:text-gold ${dark ? "border-ink-foreground/20" : "border-border"}`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          }
        />
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-4 py-4 md:-ml-5">
            {products.map((p) => (
              <CarouselItem key={p.id} className="basis-[82%] pl-4 text-foreground sm:basis-1/2 md:pl-5 lg:basis-1/3 xl:basis-1/4">
                <ProductCard product={p} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

type Banner = { id: string; eyebrow: string; title: string; subtitle: string; image_url: string; cta_label: string; cta_link: string };

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, [banners.length]);
  if (!banners.length) return null;
  const b = banners[i] ?? banners[0]!;
  const isInternal = b.cta_link.startsWith("/");
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="relative h-[440px] overflow-hidden rounded-3xl bg-ink text-ink-foreground shadow-lift sm:h-[420px]">
        <AnimatePresence mode="sync">
          <motion.img
            key={b.id}
            src={b.image_url}
            alt=""
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/20 sm:bg-gradient-to-r sm:from-ink sm:via-ink/85" />
        <div className="relative flex h-full flex-col justify-end p-6 pb-14 sm:justify-center sm:p-10 md:max-w-xl md:p-14">
          <AnimatePresence mode="wait">
            <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5 }}>
              <p className="eyebrow text-gold">{b.eyebrow}</p>
              <h2 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">{b.title}</h2>
              <p className="mt-3 text-sm text-ink-foreground/75 sm:mt-4 sm:text-base">{b.subtitle}</p>
              <Button asChild variant="gold" size="xl" className="mt-6 sm:mt-8">
                {isInternal ? <a href={b.cta_link}>{b.cta_label} <ArrowRight /></a> : <a href={b.cta_link} target="_blank" rel="noopener noreferrer">{b.cta_label} <ArrowRight /></a>}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-6 left-6 flex gap-2 sm:left-10 md:left-14">
          {banners.map((x, idx) => (
            <button
              key={x.id}
              type="button"
              aria-label={`Show banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-gold" : "w-4 bg-ink-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CollectionGrid({ products }: { products: ProductDTO[] }) {
  const cats = Array.from(new Map(products.filter((p) => p.category).map((p) => [p.category!.slug, p.category!.name])).entries());
  const [active, setActive] = useState<string>("all");
  const shown = (active === "all" ? products : products.filter((p) => p.category?.slug === active)).slice(0, 8);
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading
        eyebrow="The collection"
        title={<>Popular <em className="text-gradient-gold">sewing machines</em></>}
        subtitle="Hand-picked machines for home tailoring, boutiques and full-scale garment production."
      />
      <div className="scrollbar-none -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" role="tablist">
        {[["all", "All machines"] as const, ...cats].map(([slug, name]) => (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={active === slug}
            onClick={() => setActive(slug)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-all ${active === slug ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-gold"}`}
          >
            {name}
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

const WHY = [
  { Icon: BadgeCheck, title: "Genuine machines & parts", body: "Only reliable machines and genuine-fit spare parts — no compromises on quality." },
  { Icon: HandHeart, title: "Honest, expert advice", body: "We recommend what your work truly needs, whether you stitch at home or run a unit." },
  { Icon: Wrench, title: "In-house repair", body: "Skilled technicians for domestic and industrial machines of all brands." },
  { Icon: Zap, title: "Power-saving upgrades", body: "Servo motor conversions that cut noise and electricity bills." },
  { Icon: Truck, title: "Setup & installation", body: "Industrial tables, motors and heads assembled and tuned before you take them home." },
  { Icon: Headphones, title: "After-sales support", body: "Call or WhatsApp us anytime — we stay with you long after the purchase." },
];

export function WhyChoose() {
  return (
    <section className="grain relative overflow-hidden bg-gradient-ink py-16 text-ink-foreground md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          tone="light"
          eyebrow="Why choose SARTAJ"
          title={<>A shop built on <em className="text-gradient-gold">trust & skill</em></>}
          subtitle="Generations of tailors in and around Hariana rely on us for machines that last and service that shows up."
        />
        <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {WHY.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <div className="glass-ink group h-full rounded-2xl p-6 md:p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold/60">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-gold md:h-12 md:w-12 text-gold-foreground transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl md:mt-6 md:text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RepairSection() {
  const { contact } = useSettings();
  const services = ["Machine servicing & oiling", "Motor repair & servo conversion", "Timing, hook & feed adjustment", "Industrial setup & installation", "Spare part replacement", "Old machine restoration"];
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:gap-12">
      <Reveal className="relative">
        <div className="overflow-hidden rounded-3xl shadow-lift">
          <img src="/images/repair-service.jpg" alt="SARTAJ technician repairing an industrial sewing machine" loading="lazy" className="aspect-[4/3] w-full object-cover" />
        </div>
        <div className="glass absolute -bottom-6 right-3 rounded-2xl p-4 shadow-soft md:-right-6 md:p-5">
          <Cog className="h-6 w-6 animate-[spin_8s_linear_infinite] text-gold" />
          <p className="mt-2 font-display text-xl md:text-2xl">All brands</p>
          <p className="text-xs text-muted-foreground">Domestic · Industrial</p>
        </div>
      </Reveal>
      <div>
        <SectionHeading
          align="left"
          eyebrow="Repair & maintenance"
          title={<>Expert care that keeps you <em className="text-gradient-gold">stitching</em></>}
          subtitle="Bring your machine to our workshop — we diagnose honestly, repair properly, and use genuine-fit parts."
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <li key={s} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-gold" /> {s}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Button asChild variant="ink" size="xl"><Link to="/enquire" search={{ type: "Repair & Service" }}>Book a Service</Link></Button>
          <Button asChild variant="whatsapp" size="xl">
            <a href={whatsappLink(contact.whatsapp, "Hello SARTAJ, I need my sewing machine repaired.")} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp a photo
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

type GalleryItem = { id: string; title: string; category: string; image_url: string };

export function ImageShowcase({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading
        align="left"
        eyebrow="Inside SARTAJ"
        title={<>A glimpse of our <em className="text-gradient-gold">showroom</em></>}
        action={<Button asChild variant="outline-ink" size="xl"><Link to="/gallery">Open Gallery <ArrowRight /></Link></Button>}
      />
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4 [&>*]:mb-3 sm:[&>*]:mb-4">
        {items.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.04}>
            <Link to="/gallery" className="group relative block overflow-hidden rounded-2xl">
              <img src={g.image_url} alt={g.title} loading="lazy" className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`} />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-sm font-semibold text-ink-foreground">{g.title}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

type Testimonial = { id: string; name: string; location: string; message: string; rating: number };

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [api, setApi] = useState<CarouselApi>();
  useAutoplay(api, 6000);
  if (!items.length) return null;
  return (
    <section className="bg-secondary py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading eyebrow="Customer stories" title={<>Loved by <em className="text-gradient-gold">tailors & businesses</em></>} />
        <Carousel setApi={setApi} opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-4 md:-ml-5">
            {items.map((t) => (
              <CarouselItem key={t.id} className="basis-[90%] pl-4 sm:basis-full md:basis-1/2 md:pl-5 lg:basis-1/3">
                <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
                  <Quote className="h-8 w-8 text-gold" />
                  <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed md:text-xl">“{t.message}”</blockquote>
                  <div className="mt-6 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-gold text-gold" : "text-border"}`} />
                    ))}
                  </div>
                  <figcaption className="mt-3">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}

export function AboutIntro() {
  const { content } = useSettings();
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div>
        <SectionHeading align="left" eyebrow="About SARTAJ" title={content.aboutTitle} />
        <Reveal>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{content.aboutBody}</p>
          <div className="stitch-line mt-8 w-40" />
          <Button asChild variant="link" className="mt-6 px-0 text-base">
            <Link to="/about">Our story <ArrowRight /></Link>
          </Button>
        </Reveal>
      </div>
      <Reveal className="grid grid-cols-2 gap-3 sm:gap-4">
        <img src="/images/showroom.jpg" alt="SARTAJ showroom interior" loading="lazy" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover shadow-soft sm:rounded-3xl" />
        <img src="/images/manual-machine.jpg" alt="Classic SARTAJ tailoring machine" loading="lazy" className="aspect-square w-full rounded-2xl object-cover sm:rounded-3xl" />
        <img src="/images/spare-parts.jpg" alt="Spare parts at SARTAJ" loading="lazy" className="aspect-square w-full rounded-2xl object-cover sm:rounded-3xl" />
      </Reveal>
    </section>
  );
}

export function ContactLocation() {
  const { contact } = useSettings();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-24">
      <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:grid-cols-[1fr_1.2fr]">
        <div className="p-6 sm:p-8 md:p-12">
          <p className="eyebrow text-gold">Visit the shop</p>
          <h2 className="mt-3 text-3xl font-medium md:text-4xl">Come see the machines in person.</h2>
          <p className="mt-4 text-muted-foreground">Try machines, compare models and get expert advice. All purchases are made at our shop.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-gold" /> {contact.address}</li>
            <li className="flex gap-3"><Headphones className="h-5 w-5 shrink-0 text-gold" /> {contact.hours}</li>
          </ul>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="ink" size="xl"><a href={telLink(contact.phone)}>Call {formatPhone(contact.phone)}</a></Button>
            <Button asChild variant="whatsapp" size="xl"><a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a></Button>
            <Button asChild variant="gold" size="xl" className="sm:col-span-2"><a href={directionsLink(contact)} target="_blank" rel="noopener noreferrer"><MapPin /> Get Directions</a></Button>
          </div>
        </div>
        <MapEmbed contact={contact} className="min-h-[300px] rounded-none border-0 md:min-h-[360px]" />
      </div>
    </section>
  );
}
