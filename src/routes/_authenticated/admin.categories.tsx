import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, slugify } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: () => (
    <CrudPage
      table="categories"
      title="Categories"
      description="Product categories shown in the catalogue filters and on the home page."
      autoSlug={{ from: "name", to: "slug" }}
      searchText={(r) => `${r.name} ${r.group_name}`}
      defaults={{ name: "", slug: "", description: "", group_name: "Machines", image_url: [], sort_order: 100 }}
      toForm={(r) => ({ ...r, image_url: r.image_url ? [r.image_url] : [] })}
      fromForm={(v) => ({
        name: String(v.name ?? "").trim(),
        slug: slugify(String(v.slug || v.name || "")),
        description: v.description ?? "",
        group_name: v.group_name || "Machines",
        image_url: (v.image_url as string[])?.[0] ?? null,
        sort_order: Number(v.sort_order ?? 0),
      })}
      fields={[
        { name: "name", label: "Category name", type: "text", required: true },
        { name: "slug", label: "Web address name (slug)", type: "text" },
        { name: "group_name", label: "Group", type: "select", options: ["Machines", "Motors", "Parts & Accessories"].map((g) => ({ value: g, label: g })) },
        { name: "description", label: "Description", type: "textarea", rows: 2 },
        { name: "image_url", label: "Category image", type: "images", folder: "categories", multiple: false },
        { name: "sort_order", label: "Display order", type: "number" },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-4">
          {r.image_url ? <img src={String(r.image_url)} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <div className="h-14 w-14 rounded-xl bg-secondary" />}
          <div>
            <p className="font-semibold">{String(r.name)}</p>
            <p className="text-xs text-muted-foreground">{String(r.group_name)} · /{String(r.slug)}</p>
          </div>
        </div>
      )}
    />
  ),
});
