import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Images, Inbox, Package, Shapes } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "./admin.enquiries";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [p, c, g, e, n, recent] = await Promise.all([
        supabase.from("products").select("id", head),
        supabase.from("categories").select("id", head),
        supabase.from("gallery_images").select("id", head),
        supabase.from("enquiries").select("id", head),
        supabase.from("enquiries").select("id", head).eq("status", "new"),
        supabase.from("enquiries").select("id, reference, name, phone, city, product_name, enquiry_type, status, created_at").order("created_at", { ascending: false }).limit(6),
      ]);
      return { products: p.count ?? 0, categories: c.count ?? 0, gallery: g.count ?? 0, enquiries: e.count ?? 0, newEnquiries: n.count ?? 0, recent: recent.data ?? [] };
    },
  });

  const stats = [
    { label: "New enquiries", value: data?.newEnquiries, Icon: Inbox, to: "/admin/enquiries" as const, highlight: true },
    { label: "Total enquiries", value: data?.enquiries, Icon: Inbox, to: "/admin/enquiries" as const },
    { label: "Products", value: data?.products, Icon: Package, to: "/admin/products" as const },
    { label: "Categories", value: data?.categories, Icon: Shapes, to: "/admin/categories" as const },
    { label: "Gallery photos", value: data?.gallery, Icon: Images, to: "/admin/gallery" as const },
  ];

  return (
    <div>
      <p className="eyebrow text-gold">Welcome back</p>
      <h1 className="mt-2 text-4xl">SARTAJ dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, Icon, to, highlight }) => (
          <Link key={label} to={to} className={`rounded-2xl border p-5 shadow-soft transition-all hover:-translate-y-0.5 ${highlight ? "border-gold bg-gradient-gold text-gold-foreground" : "border-border bg-card"}`}>
            <Icon className="h-5 w-5" />
            <p className="mt-4 font-display text-4xl">{value ?? "—"}</p>
            <p className="text-sm opacity-75">{label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Latest enquiries</h2>
          <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {data?.recent.length === 0 && <p className="py-6 text-sm text-muted-foreground">No enquiries yet.</p>}
          {data?.recent.map((e) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{e.name} <span className="font-normal text-muted-foreground">· {e.city}</span></p>
                <p className="text-xs text-muted-foreground">{e.product_name || e.enquiry_type} · {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>
              <StatusBadge status={e.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
