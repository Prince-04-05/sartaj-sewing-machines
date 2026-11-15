import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { getPublicClient } = await import("@/lib/supabase-public.server");
        const sb = getPublicClient();
        const { data } = await sb.from("products").select("slug, updated_at").eq("is_published", true);
        const staticPaths = ["/", "/products", "/gallery", "/services", "/about", "/contact", "/enquire"];
        const urls = [
          ...staticPaths.map((p) => `<url><loc>${origin}${p}</loc><changefreq>weekly</changefreq></url>`),
          ...(data ?? []).map(
            (p) => `<url><loc>${origin}/products/${p.slug}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
