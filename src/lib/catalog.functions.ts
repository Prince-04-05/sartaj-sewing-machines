import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { mergeSettings, type CategoryDTO, type ProductDTO, type Spec } from "./site";

const PRODUCT_COLS =
  "id, slug, name, short_description, description, features, specifications, images, is_featured, is_best_seller, sort_order, created_at, category:categories(id, slug, name, group_name)";

type RawProduct = Omit<ProductDTO, "specifications"> & { specifications: unknown };

function toProduct(p: RawProduct): ProductDTO {
  const specs = Array.isArray(p.specifications) ? (p.specifications as Spec[]) : [];
  return { ...p, specifications: specs, features: p.features ?? [], images: p.images ?? [] };
}

async function client() {
  const { getPublicClient } = await import("./supabase-public.server");
  return getPublicClient();
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb.from("site_settings").select("key, value");
  if (error) console.error("settings", error.message);
  return mergeSettings(data as { key: string; value: unknown }[] | null);
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name, description, image_url, group_name, sort_order")
    .order("sort_order");
  if (error) throw new Error("Could not load categories");
  return (data ?? []) as CategoryDTO[];
});

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_COLS)
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error("Could not load products");
  return ((data ?? []) as unknown as RawProduct[]).map(toProduct);
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1).max(160) }).parse(input))
  .handler(async ({ data }) => {
    const sb = await client();
    const { data: row, error } = await sb
      .from("products")
      .select(PRODUCT_COLS)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error("Could not load product");
    if (!row) throw notFound();
    const product = toProduct(row as unknown as RawProduct);
    let relatedQ = sb.from("products").select(PRODUCT_COLS).eq("is_published", true).neq("id", product.id).limit(4);
    if (product.category) relatedQ = relatedQ.eq("category_id", product.category.id);
    const { data: rel } = await relatedQ.order("sort_order");
    let related = ((rel ?? []) as unknown as RawProduct[]).map(toProduct);
    if (related.length < 4) {
      const { data: more } = await sb
        .from("products")
        .select(PRODUCT_COLS)
        .eq("is_published", true)
        .neq("id", product.id)
        .eq("is_featured", true)
        .limit(8);
      const extra = ((more ?? []) as unknown as RawProduct[]).map(toProduct).filter((m) => !related.some((r) => r.id === m.id));
      related = [...related, ...extra].slice(0, 4);
    }
    return { product, related };
  });

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const [banners, products, categories, testimonials, gallery] = await Promise.all([
    sb.from("banners").select("id, eyebrow, title, subtitle, image_url, cta_label, cta_link").eq("is_active", true).order("sort_order"),
    sb.from("products").select(PRODUCT_COLS).eq("is_published", true).order("sort_order"),
    sb.from("categories").select("id, slug, name, description, image_url, group_name, sort_order").order("sort_order"),
    sb.from("testimonials").select("id, name, location, message, rating").eq("is_active", true).order("sort_order"),
    sb.from("gallery_images").select("id, title, category, image_url").order("sort_order").limit(8),
  ]);
  const all = ((products.data ?? []) as unknown as RawProduct[]).map(toProduct);
  return {
    banners: banners.data ?? [],
    featured: all.filter((p) => p.is_featured),
    bestSellers: all.filter((p) => p.is_best_seller),
    machines: all.filter((p) => p.category?.group_name === "Machines"),
    partsAndMotors: all.filter((p) => p.category?.group_name !== "Machines"),
    categories: (categories.data ?? []) as CategoryDTO[],
    testimonials: testimonials.data ?? [],
    gallery: gallery.data ?? [],
  };
});

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data, error } = await sb.from("gallery_images").select("id, title, category, image_url").order("sort_order");
  if (error) throw new Error("Could not load gallery");
  return data ?? [];
});

export const listTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const sb = await client();
  const { data } = await sb.from("testimonials").select("id, name, location, message, rating").eq("is_active", true).order("sort_order");
  return data ?? [];
});
