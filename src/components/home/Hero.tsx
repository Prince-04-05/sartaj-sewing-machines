import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowRight, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { directionsLink } from "@/lib/site";

export function Hero() {
  const { content, contact } = useSettings();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, reduce ? 1.04 : 1.14]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const words = content.heroTitle.split(" ");

  return (
    <section ref={ref} className="grain relative min-h-[calc(100svh-104px)] overflow-hidden bg-ink text-ink-foreground">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
        <img
          src="/images/hero-machine.jpg"
          alt="SARTAJ premium industrial sewing machine under golden studio light"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="h-full w-full object-cover object-[70%_center]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div style={{ y: textY, opacity: fade }} className="relative mx-auto flex min-h-[calc(100svh-104px)] max-w-7xl flex-col justify-center px-4 pb-14 pt-12 md:px-6 md:pb-24 md:pt-16">
        <p className="eyebrow flex items-center gap-3 text-gold animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">
          <span className="h-px w-10 bg-gold" /> {content.heroEyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-[2.6rem] font-medium leading-[1.02] min-[400px]:text-5xl sm:text-6xl md:mt-6 md:text-7xl md:leading-[0.98] lg:text-[5.6rem]">
          {words.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className={`hero-word mr-[0.22em] inline-block origin-bottom ${i >= words.length - 2 ? "italic text-gradient-gold" : ""}`}
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              {w}
            </span>
          ))}
        </h1>
        <p
          className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both mt-5 max-w-xl text-[0.95rem] leading-relaxed text-ink-foreground/75 md:mt-6 md:text-lg"
        >
          {content.heroSubtitle}
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both mt-8 grid gap-3 sm:flex sm:flex-wrap md:mt-10">
          <Button asChild variant="gold" size="xl">
            <Link to="/products">
              Explore Collection <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline-gold" size="xl">
            <a href={directionsLink(contact)} target="_blank" rel="noopener noreferrer">
              <MapPin /> Visit Our Showroom
            </a>
          </Button>
        </div>

        <div className="animate-in fade-in duration-1000 delay-1000 fill-mode-both mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3 md:mt-14">
          {[
            { k: "20+", v: "Product categories" },
            { k: "All", v: "Brands repaired" },
            { k: "100%", v: "Genuine-fit parts" },
          ].map((s) => (
            <div key={s.v} className="glass-ink min-w-0 rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
              <p className="font-display text-2xl text-gold sm:text-3xl">{s.k}</p>
              <p className="mt-1 text-[0.68rem] leading-snug text-ink-foreground/70 sm:text-xs">{s.v}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div
        className="animate-in fade-in slide-in-from-right-6 duration-1000 delay-1000 fill-mode-both glass-ink absolute bottom-10 right-28 hidden max-w-xs animate-float rounded-2xl p-5 lg:block"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold text-gold-foreground"><Wrench className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold">Repair & servicing</p>
            <p className="text-xs text-ink-foreground/65">Domestic & industrial, all brands</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-foreground/70">
          <ShieldCheck className="h-4 w-4 text-gold" /> Honest advice before you buy
        </div>
      </div>
    </section>
  );
}
