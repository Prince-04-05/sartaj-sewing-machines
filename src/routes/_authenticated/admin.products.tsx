import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, slugify, type Row } from "@/components/admin/CrudPage";
import type { Spec } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

function ProductsAdmin() {
  const { data: cats = [] } = useQuery({
    queryKey: ["admin", "categories-options"],
    queryFn: async () => (await supabase.from("categories").select("id, name").order("sort_order")).data ?? [],
  });
  const catName = (id: unknown) => cats.find((c) => c.id === id)?.name ?? "Uncategorised";

  return (
    <CrudPage
      table="products"
      title="Products"
      description="Add, edit and organise every product. Prices are never shown on the website."
      autoSlug={{ from: "name", to: "slug" }}
      searchText={(r) => `${r.name} ${r.slug} ${catName(r.category_id)}`}
      layout="grid"
      defaults={{ name: "", slug: "", category_id: "", short_description: "", description: "", features: "", specifications: "", images: [], is_featured: false, is_best_seller: false, is_published: true, sort_order: 100 }}
      toForm={(r: Row) => ({
        ...r,
        category_id: r.category_id ?? "",
        features: ((r.features as string[]) ?? []).join("\n"),
        specifications: ((r.specifications as Spec[]) ?? []).map((s) => `${s.label}: ${s.value}`).join("\n"),
      })}
      fromForm={(v) => ({
        name: String(v.name ?? "").trim(),
        slug: slugify(String(v.slug || v.name || "")),
        category_id: v.category_id || null,
        short_description: v.short_description ?? "",
        description: v.description ?? "",
        features: String(v.features ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
        specifications: String(v.specifications ?? "")
          .split("\n")
          .map((line) => {
            const i = line.indexOf(":");
            return i > 0 ? { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : null;
          })
          .filter(Boolean),
        images: v.images ?? [],
        is_featured: !!v.is_featured,
        is_best_seller: !!v.is_best_seller,
        is_published: !!v.is_published,
        sort_order: Number(v.sort_order ?? 0),
      })}
      fields={[
        { name: "name", label: "Product name", type: "text", required: true },
        { name: "slug", label: "Web address name (slug)", type: "text", hint: "Used in the page link, e.g. sartaj-overlock-4-thread" },
        { name: "category_id", label: "Category", type: "select", options: cats.map((c) => ({ value: c.id, label: c.name })) },
        { name: "images", label: "Product images", type: "images", folder: "products", hint: "First image is the main photo. SARTAJ label is added automatically on the website." },
        { name: "short_description", label: "Short description", type: "textarea", rows: 2 },
        { name: "description", label: "Full description", type: "textarea", rows: 5 },
        { name: "features", label: "Features (one per line)", type: "textarea", rows: 5 },
        { name: "specifications", label: "Specifications (one per line, Label: Value)", type: "textarea", rows: 5, hint: "Example — Max speed: 5000 SPM" },
        { name: "is_published", label: "Show on website", type: "switch" },
        { name: "is_featured", label: "Featured", type: "switch", hint: "Shown in the Featured Machines slider" },
        { name: "is_best_seller", label: "Best seller", type: "switch" },
        { name: "sort_order", label: "Display order", type: "number", hint: "Lower numbers appear first" },
      ]}
      renderRow={(r) => (
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
            {(r.images as string[])?.[0] && <img src={(r.images as string[])[0]} alt="" className="h-full w-full object-cover" loading="lazy" />}
          </div>
          <p className="eyebrow mt-3 text-[0.58rem] text-gold">{catName(r.category_id)}</p>
          <p className="mt-1 font-semibold">{String(r.name)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[0.65rem]">
            {!r.is_published && <span className="rounded-full bg-muted px-2 py-0.5">Hidden</span>}
            {!!r.is_featured && <span className="rounded-full bg-gold-soft px-2 py-0.5">Featured</span>}
            {!!r.is_best_seller && <span className="rounded-full bg-gold-soft px-2 py-0.5">Best seller</span>}
          </div>
        </div>
      )}
    />
  );
}
