import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function PageHero({ eyebrow, title, subtitle, image }: { eyebrow: string; title: ReactNode; subtitle?: string; image?: string }) {
  return (
    <section className="grain relative overflow-hidden bg-ink pb-14 pt-14 text-ink-foreground md:pb-20 md:pt-24">
      {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/50 md:to-ink/40" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-gold"><span className="h-px w-10 bg-gold" />{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-[2.5rem] font-medium leading-[1.05] sm:text-5xl md:mt-5 md:text-6xl md:leading-[1.02]">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-[0.95rem] text-ink-foreground/75 md:mt-5 md:text-lg">{subtitle}</p>}
        </Reveal>
      </div>
    </section>
  );
}
