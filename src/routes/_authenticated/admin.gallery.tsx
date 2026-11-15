import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/admin/CrudPage";

const GROUPS = ["Machines", "Motors & Parts", "Showroom", "Collections", "Repair & Service"];

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: () => (
    <CrudPage
      table="gallery_images"
      title="Gallery photos"
      description="Photos for the Gallery page. The category becomes a filter button."
      layout="grid"
      searchText={(r) => `${r.title} ${r.category}`}
      defaults={{ title: "", category: "Machines", image_url: [], sort_order: 100 }}
      toForm={(r) => ({ ...r, image_url: r.image_url ? [r.image_url] : [] })}
      fromForm={(v) => {
        const url = (v.image_url as string[])?.[0];
        if (!url) throw new Error("Please add a photo");
        return { title: v.title ?? "", category: v.category || "Machines", image_url: url, sort_order: Number(v.sort_order ?? 0) };
      }}
      fields={[
        { name: "image_url", label: "Photo", type: "images", folder: "gallery", multiple: false },
        { name: "title", label: "Caption", type: "text" },
        { name: "category", label: "Category", type: "select", options: GROUPS.map((g) => ({ value: g, label: g })) },
        { name: "sort_order", label: "Display order", type: "number" },
      ]}
      renderRow={(r) => (
        <div>
          <img src={String(r.image_url)} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
          <p className="mt-2 text-sm font-semibold">{String(r.title) || "Untitled"}</p>
          <p className="text-xs text-muted-foreground">{String(r.category)}</p>
        </div>
      )}
    />
  ),
});
