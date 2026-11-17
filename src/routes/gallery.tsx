import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { CrownMark } from "@/components/site/Logo";
import { galleryQuery } from "@/lib/queries";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  head: () => ({
    meta: [
      { title: "Gallery — Machines, Showroom & Workshop | SARTAJ" },
      { name: "description", content: "Photos of SARTAJ's sewing machines, motors, spare parts, showroom and repair workshop in Hariana, Punjab." },
      { property: "og:title", content: "SARTAJ Gallery" },
      { property: "og:description", content: "A look inside the SARTAJ showroom: machines, parts, collections and our repair bench." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(galleryQuery);
  const cats = useMemo(() => ["All", ...Array.from(new Set(data.map((g) => g.category)))], [data]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const items = cat === "All" ? data : data.filter((g) => g.category === cat);

  const next = useCallback(() => setOpen((i) => (i === null ? null : (i + 1) % items.length)), [items.length]);
  const prev = useCallback(() => setOpen((i) => (i === null ? null : (i - 1 + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, next, prev]);

  const current = open !== null ? items[open] : null;

  return (
    <>
      <PageHero eyebrow="Gallery" title={<>The SARTAJ <em className="text-gradient-gold">portfolio</em></>} subtitle="Machines, motors, parts, our showroom and the workshop where we bring machines back to life." image="/images/showroom.jpg" />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-10 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" role="tablist" aria-label="Gallery categories">
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-2 text-sm transition-all ${cat === c ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-gold"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <motion.div layout className="columns-2 gap-3 sm:gap-4 lg:columns-3 lg:gap-5 [&>*]:mb-3 sm:[&>*]:mb-4 lg:[&>*]:mb-5">
          <AnimatePresence mode="popLayout">
            {items.map((g, i) => (
              <motion.button
                layout
                key={g.id}
                type="button"
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(i, 9) * 0.03 }}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-xl bg-secondary text-left sm:rounded-2xl"
                aria-label={`Open ${g.title}`}
              >
                <img src={g.image_url} alt={g.title} loading="lazy" className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${["aspect-[4/5]", "aspect-square", "aspect-[4/3]"][i % 3]}`} />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/85 via-ink/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div>
                    <p className="eyebrow text-[0.58rem] text-gold">{g.category}</p>
                    <p className="mt-1 font-display text-xl text-ink-foreground">{g.title}</p>
                  </div>
                  <Expand className="h-5 w-5 text-ink-foreground" />
                </div>
                <span className="glass-ink absolute left-2 top-2 inline-flex sm:left-3 sm:top-3 items-center gap-1 rounded-full px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.25em] text-ink-foreground">
                  <CrownMark className="h-3 w-3" /> SARTAJ
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <button type="button" aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-ink-foreground" onClick={() => setOpen(null)}>
              <X className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Previous image" className="absolute bottom-6 left-[calc(50%-3.5rem)] z-10 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-ink/60 text-ink-foreground md:bottom-auto md:left-8 md:top-1/2 md:-translate-y-1/2" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" aria-label="Next image" className="absolute bottom-6 right-[calc(50%-3.5rem)] z-10 grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-ink/60 text-ink-foreground md:bottom-auto md:right-8 md:top-1/2 md:-translate-y-1/2" onClick={(e) => { e.stopPropagation(); next(); }}>
              <ChevronRight className="h-6 w-6" />
            </button>
            <motion.figure key={current.id} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.35 }} className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <img src={current.image_url} alt={current.title} className="mx-auto max-h-[65vh] w-auto rounded-2xl object-contain md:max-h-[80vh]" />
              <figcaption className="mt-4 text-center text-ink-foreground">
                <span className="eyebrow text-gold">{current.category}</span>
                <p className="mt-1 font-display text-xl md:text-2xl">{current.title}</p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
