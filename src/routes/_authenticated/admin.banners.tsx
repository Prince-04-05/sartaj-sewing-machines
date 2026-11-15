import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: () => (
    <CrudPage
      table="banners"
      title="Banners"
      description="Promotional slides shown on the home page."
      defaults={{ eyebrow: "", title: "", subtitle: "", image_url: [], cta_label: "Explore", cta_link: "/products", is_active: true, sort_order: 100 }}
      toForm={(r) => ({ ...r, image_url: r.image_url ? [r.image_url] : [] })}
      fromForm={(v) => {
        const url = (v.image_url as string[])?.[0];
        if (!url) throw new Error("Please add a banner image");
        return { eyebrow: v.eyebrow ?? "", title: String(v.title ?? "").trim(), subtitle: v.subtitle ?? "", image_url: url, cta_label: v.cta_label || "Explore", cta_link: v.cta_link || "/products", is_active: !!v.is_active, sort_order: Number(v.sort_order ?? 0) };
      }}
      fields={[
        { name: "image_url", label: "Banner image", type: "images", folder: "banners", multiple: false },
        { name: "eyebrow", label: "Small label", type: "text" },
        { name: "title", label: "Headline", type: "text", required: true },
        { name: "subtitle", label: "Sub-text", type: "textarea", rows: 2 },
        { name: "cta_label", label: "Button text", type: "text" },
        { name: "cta_link", label: "Button link", type: "text", hint: "e.g. /products, /services or a full https:// link" },
        { name: "is_active", label: "Show on website", type: "switch" },
        { name: "sort_order", label: "Display order", type: "number" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-4">
          <img src={String(r.image_url)} alt="" className="h-16 w-28 rounded-xl object-cover" />
          <div>
            <p className="font-semibold">{String(r.title)}</p>
            <p className="text-xs text-muted-foreground">{r.is_active ? "Active" : "Hidden"} · {String(r.cta_label)} → {String(r.cta_link)}</p>
          </div>
        </div>
      )}
    />
  ),
});
