import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { categoriesQuery, productsQuery } from "@/lib/queries";

type Sort = "featured" | "name-asc" | "name-desc" | "newest";
type ProductsSearch = { q?: string | undefined; category?: string | undefined; sort?: Sort | undefined };

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "newest", label: "Newest" },
];

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): ProductsSearch => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 80) : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
    sort: SORTS.some((x) => x.value === s["sort"]) ? (s["sort"] as Sort) : undefined,
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Sewing Machines, Motors & Spare Parts Catalogue | SARTAJ" },
      { name: "description", content: "Browse SARTAJ's full catalogue: domestic, industrial, overlock, interlock and embroidery machines, servo motors, tables, needles, bobbins and spare parts." },
      { property: "og:title", content: "SARTAJ Product Catalogue" },
      { property: "og:description", content: "Every sewing machine, motor and spare part we stock — enquire online and visit our Hariana shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { q, category, sort = "featured" } = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const [term, setTerm] = useState(q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setTerm(q ?? ""), [q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if ((term || undefined) !== q) navigate({ search: (prev) => ({ ...prev, q: term || undefined }), replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [term, q, navigate]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof categories>();
    for (const c of categories) map.set(c.group_name, [...(map.get(c.group_name) ?? []), c]);
    return Array.from(map.entries());
  }, [categories]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.category) m.set(p.category.slug, (m.get(p.category.slug) ?? 0) + 1);
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const t = (q ?? "").toLowerCase();
    let list = products.filter((p) => (!category || p.category?.slug === category));
    if (t) list = list.filter((p) => [p.name, p.short_description, p.description, p.category?.name ?? "", ...p.features].join(" ").toLowerCase().includes(t));
    const sorted = [...list];
    if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name-desc") sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "newest") sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sort === "featured") sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
    return sorted;
  }, [products, q, category, sort]);

  const activeCat = categories.find((c) => c.slug === category);

  const filterList = (
    <nav aria-label="Product categories" className="space-y-8">
      <Link
        to="/products"
        search={(prev) => ({ ...prev, category: undefined })}
        onClick={() => setFiltersOpen(false)}
        className={`block rounded-xl px-3 py-2 text-sm font-semibold ${!category ? "bg-ink text-ink-foreground" : "hover:bg-secondary"}`}
      >
        All products <span className="opacity-60">({products.length})</span>
      </Link>
      {groups.map(([group, cats]) => (
        <div key={group}>
          <p className="eyebrow mb-3 px-3 text-[0.62rem] text-gold">{group}</p>
          <ul className="space-y-0.5">
            {cats.map((c) => (
              <li key={c.id}>
                <Link
                  to="/products"
                  search={(prev) => ({ ...prev, category: c.slug })}
                  onClick={() => setFiltersOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${category === c.slug ? "bg-ink text-ink-foreground" : "text-foreground/80 hover:bg-secondary"}`}
                >
                  <span>{c.name}</span>
                  <span className="text-xs opacity-60">{counts.get(c.slug) ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div>
      <section className="grain relative overflow-hidden bg-gradient-ink pb-16 pt-20 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <p className="eyebrow text-gold">The SARTAJ catalogue</p>
            <h1 className="mt-4 text-5xl font-medium md:text-6xl">{activeCat ? activeCat.name : <>Machines, motors <em className="text-gradient-gold">& parts</em></>}</h1>
            <p className="mt-4 max-w-2xl text-ink-foreground/70">
              {activeCat ? activeCat.description : "Explore our full range. Every product is available to see and buy at our Hariana shop — send an enquiry and we'll guide you."}
            </p>
          </Reveal>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <label className="glass-ink flex h-13 flex-1 items-center gap-3 rounded-full px-5" style={{ height: 52 }}>
              <Search className="h-5 w-5 text-gold" />
              <span className="sr-only">Search products</span>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search machines, motors, needles, bobbins…"
                className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-ink-foreground/50"
              />
              {term && (
                <button type="button" onClick={() => setTerm("")} aria-label="Clear search"><X className="h-4 w-4" /></button>
              )}
            </label>
            <label className="glass-ink flex items-center gap-2 rounded-full px-5" style={{ height: 52 }}>
              <span className="text-xs text-ink-foreground/60">Sort</span>
              <select
                value={sort}
                onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value as Sort }) })}
                className="bg-transparent text-sm font-semibold outline-none [&>option]:text-foreground"
                aria-label="Sort products"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">{filterList}</div>
        </aside>
        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{filtered.length}</strong> {filtered.length === 1 ? "product" : "products"}
              {q && <> for “{q}”</>}
            </p>
            <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Categories
            </button>
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center">
              <h2 className="text-2xl">Nothing found here yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">We stock far more than we list. Send an enquiry and we'll check for you.</p>
              <Link to="/enquire" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground">Ask about a product</Link>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}>
                    <ProductCard product={p} eager={i < 3} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close filters" className="absolute inset-0 bg-ink/60" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }} className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-2xl">Categories</p>
                <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
              {filterList}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
