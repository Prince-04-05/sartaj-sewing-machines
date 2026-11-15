import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronRight, MapPin, MessageSquareText, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandedImage } from "@/components/site/BrandedImage";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { productQuery } from "@/lib/queries";
import { directionsLink, formatPhone, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data) throw notFound();
    return { name: data.product.name, description: data.product.short_description, category: data.product.category?.name ?? "" };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} | SARTAJ Sewing Machines` : "Product unavailable | SARTAJ";
    const description = loaderData?.description || "SARTAJ sewing machines, motors and spare parts — Hariana, Punjab.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="text-4xl">Product not found</h1>
      <p className="mt-3 text-muted-foreground">It may have been moved or is no longer listed.</p>
      <Link to="/products" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground">Back to catalogue</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { product, related } = data;
  const { contact } = useSettings();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const images = product.images.length ? product.images : ["/images/showroom.jpg"];
  const waText = `Hello SARTAJ, I'm interested in the ${product.name}. Please share details.`;

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-foreground">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to="/products" search={{ category: product.category.slug }} className="hover:text-foreground">{product.category.name}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <div
            className="relative cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <BrandedImage
                  src={images[active]}
                  alt={`${product.name} — image ${active + 1}`}
                  eager
                  className="aspect-square"
                  imgClassName="transition-transform duration-300"
                />
              </motion.div>
            </AnimatePresence>
            {zoom && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden md:block"
                style={{ backgroundImage: `url(${images[active]})`, backgroundSize: "200%", backgroundPosition: `${zoom.x}% ${zoom.y}%` }}
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-4">
          {product.category && <p className="eyebrow text-gold">{product.category.name}</p>}
          <h1 className="mt-3 text-4xl font-medium leading-tight md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.short_description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.is_best_seller && <span className="rounded-full bg-gradient-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">Best Seller</span>}
            <span className="rounded-full border border-border px-3 py-1 text-xs">Available at our Hariana shop</span>
          </div>

          {product.features.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-gold"><Check className="h-3 w-3" /></span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="gold" size="xl" className="sm:col-span-2">
              <a href="#enquire"><MessageSquareText /> Enquire Now</a>
            </Button>
            <Button asChild variant="ink" size="xl">
              <a href={telLink(contact.phone)}><Phone /> Call {formatPhone(contact.phone)}</a>
            </Button>
            <Button asChild variant="whatsapp" size="xl">
              <a href={whatsappLink(contact.whatsapp, waText)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-4 w-4" /> WhatsApp Enquiry</a>
            </Button>
          </div>
          <a href={directionsLink(contact)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <MapPin className="h-4 w-4 text-gold" /> See it in person — get directions to our shop
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="text-3xl">Description</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">{product.description}</p>
        </Reveal>
        {product.specifications.length > 0 && (
          <Reveal>
            <h2 className="text-3xl">Specifications</h2>
            <dl className="mt-4 overflow-hidden rounded-2xl border border-border">
              {product.specifications.map((s, i) => (
                <div key={s.label + i} className={`grid grid-cols-[40%_1fr] gap-4 px-5 py-3.5 text-sm ${i % 2 ? "bg-card" : "bg-secondary"}`}>
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </section>

      <section id="enquire" className="mx-auto mt-20 max-w-3xl scroll-mt-28 px-4 md:px-6">
        <div className="mb-8 text-center">
          <p className="eyebrow text-gold">Enquire about this product</p>
          <h2 className="mt-3 text-4xl">Interested in the {product.name}?</h2>
          <p className="mt-3 text-muted-foreground">Share your details — we'll call you back and help you plan your visit.</p>
        </div>
        <EnquiryForm product={{ id: product.id, name: product.name }} />
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-4xl">You may also like</h2>
            <Link to="/products" className="hidden items-center gap-1 text-sm text-muted-foreground hover:text-foreground sm:inline-flex">
              <ArrowLeft className="h-4 w-4" /> All products
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
