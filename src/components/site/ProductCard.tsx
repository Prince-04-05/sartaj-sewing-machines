import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { ArrowUpRight, MessageSquareText } from "lucide-react";
import type { ProductDTO } from "@/lib/site";
import { BrandedImage } from "./BrandedImage";
import { Button } from "@/components/ui/button";
import type { MouseEvent } from "react";

export function ProductCard({ product, eager }: { product: ProductDTO; eager?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-500 hover:shadow-lift"
    >
      <Link to="/products/$slug" params={{ slug: product.slug }} className="block" aria-label={product.name}>
        <BrandedImage
          src={product.images[0]}
          alt={product.name}
          eager={eager}
          className="aspect-[4/3.4]"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </Link>
      {(product.is_best_seller || product.is_featured) && (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-gold px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-gold-foreground">
          {product.is_best_seller ? "Best Seller" : "Featured"}
        </span>
      )}
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <p className="eyebrow text-[0.62rem] text-gold">{product.category.name}</p>
        )}
        <h3 className="mt-2 text-xl font-medium leading-snug">
          <Link to="/products/$slug" params={{ slug: product.slug }} className="hover:text-gold">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        {product.features.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {product.features.slice(0, 2).map((f) => (
              <li key={f} className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] text-secondary-foreground">
                {f}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex gap-2 pt-5">
          <Button asChild variant="outline-ink" size="sm" className="flex-1 rounded-full">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              View Details <ArrowUpRight />
            </Link>
          </Button>
          <Button asChild variant="ink" size="sm" className="flex-1 rounded-full">
            <Link to="/enquire" search={{ product: product.slug }}>
              <MessageSquareText /> Enquire Now
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
