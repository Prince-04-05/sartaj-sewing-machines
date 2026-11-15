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
    <section ref={ref} className="grain relative -mt-[72px] min-h-[100svh] overflow-hidden bg-ink text-ink-foreground">
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

      <motion.div style={{ y: textY, opacity: fade }} className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-24 pt-36 md:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow flex items-center gap-3 text-gold"
        >
          <span className="h-px w-10 bg-gold" /> {content.heroEyebrow}
        </motion.p>
        <h1 className="mt-6 max-w-3xl text-5xl font-medium leading-[0.98] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`mr-[0.22em] inline-block origin-bottom ${i >= words.length - 2 ? "italic text-gradient-gold" : ""}`}
              style={{ transformPerspective: 600 }}
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/75 md:text-lg"
        >
          {content.heroSubtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-10 flex flex-wrap gap-3"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-14 grid max-w-2xl grid-cols-3 gap-3"
        >
          {[
            { k: "20+", v: "Product categories" },
            { k: "All", v: "Brands repaired" },
            { k: "100%", v: "Genuine-fit parts" },
          ].map((s) => (
            <div key={s.v} className="glass-ink rounded-2xl px-4 py-4">
              <p className="font-display text-3xl text-gold">{s.k}</p>
              <p className="mt-1 text-xs text-ink-foreground/70">{s.v}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1.1 }}
        className="glass-ink absolute bottom-10 right-6 hidden max-w-xs animate-float rounded-2xl p-5 lg:block"
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
      </motion.div>
    </section>
  );
}
