import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { CrudPage } from "@/components/admin/CrudPage";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <CrudPage
      table="testimonials"
      title="Testimonials"
      description="Customer reviews shown on the home and About pages."
      searchText={(r) => `${r.name} ${r.location} ${r.message}`}
      defaults={{ name: "", location: "", message: "", rating: 5, is_active: true, sort_order: 100 }}
      fromForm={(v) => ({ name: String(v.name ?? "").trim(), location: v.location ?? "", message: String(v.message ?? "").trim(), rating: Math.min(5, Math.max(1, Number(v.rating ?? 5))), is_active: !!v.is_active, sort_order: Number(v.sort_order ?? 0) })}
      toForm={(r) => ({ ...r })}
      fields={[
        { name: "name", label: "Customer name", type: "text", required: true },
        { name: "location", label: "Town / city", type: "text" },
        { name: "message", label: "Review", type: "textarea", required: true },
        { name: "rating", label: "Rating (1–5)", type: "number" },
        { name: "is_active", label: "Show on website", type: "switch" },
        { name: "sort_order", label: "Display order", type: "number" },
      ]}
      renderRow={(r) => (
        <div>
          <div className="flex items-center gap-1">{Array.from({ length: Number(r.rating) }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}</div>
          <p className="mt-2 text-sm">“{String(r.message)}”</p>
          <p className="mt-2 text-xs text-muted-foreground">{String(r.name)} · {String(r.location)} {r.is_active ? "" : "· Hidden"}</p>
        </div>
      )}
    />
  ),
});
