import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Phone, ShieldCheck, Store } from "lucide-react";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { BrandedImage } from "@/components/site/BrandedImage";
import { productsQuery } from "@/lib/queries";
import { ENQUIRY_TYPES } from "@/lib/site";

type EnquireSearch = { product?: string | undefined; type?: (typeof ENQUIRY_TYPES)[number] | undefined };

export const Route = createFileRoute("/enquire")({
  validateSearch: (s: Record<string, unknown>): EnquireSearch => ({
    product: typeof s["product"] === "string" && s["product"] ? s["product"] : undefined,
    type: ENQUIRY_TYPES.includes(s["type"] as (typeof ENQUIRY_TYPES)[number]) ? (s["type"] as (typeof ENQUIRY_TYPES)[number]) : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  head: () => ({
    meta: [
      { title: "Send an Enquiry | SARTAJ Sewing Machines" },
      { name: "description", content: "Enquire about any SARTAJ sewing machine, motor, spare part or repair service. We'll contact you and welcome you at our Hariana shop." },
      { property: "og:title", content: "Enquire with SARTAJ" },
      { property: "og:description", content: "Tell us what you need — we'll call you back and help you plan your shop visit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EnquirePage,
});

function EnquirePage() {
  const { product: slug, type } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery);
  const product = slug ? products.find((p) => p.slug === slug) : undefined;

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1fr_1.4fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow text-gold">Enquiry & shop visit</p>
        <h1 className="mt-3 text-5xl font-medium leading-tight">{product ? "Enquire about this product" : "How can we help?"}</h1>
        <p className="mt-4 text-muted-foreground">Fill in your details and our team will contact you. Purchases are made in person at our shop — no online payment needed.</p>
        {product && (
          <div className="mt-8 flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <BrandedImage src={product.images[0]} alt={product.name} className="h-24 w-24 shrink-0 rounded-xl" badge={false} />
            <div>
              <p className="eyebrow text-[0.6rem] text-gold">{product.category?.name}</p>
              <p className="mt-1 font-display text-xl">{product.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.short_description}</p>
            </div>
          </div>
        )}
        <ol className="mt-10 space-y-5">
          {[
            [ShieldCheck, "Send your enquiry", "Takes less than a minute."],
            [Phone, "We contact you", "By call or WhatsApp, usually the same day."],
            [Store, "Visit the shop", "See the machine run, ask questions, buy in person."],
            [MapPin, "Expert setup", "We help you set up and stay for after-sales service."],
          ].map(([Icon, t, b], i) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <li key={t as string} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-gold"><I className="h-4 w-4" /></span>
                <div>
                  <p className="font-semibold">{i + 1}. {t as string}</p>
                  <p className="text-sm text-muted-foreground">{b as string}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>
      <div>
        <EnquiryForm
          product={product ? { id: product.id, name: product.name } : null}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          defaultType={type ?? "Product Enquiry"}
        />
      </div>
    </div>
  );
}
