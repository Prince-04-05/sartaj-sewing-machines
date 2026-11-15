import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ExternalLink, Image as ImageIcon, Images, LayoutDashboard, Loader2, LogOut, Menu, MessageSquareQuote, Package, Settings, Shapes, Inbox, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | SARTAJ" },
      { name: "description", content: "SARTAJ store management dashboard." },
      { property: "og:title", content: "SARTAJ Admin" },
      { property: "og:description", content: "SARTAJ store management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Shapes },
  { to: "/admin/gallery", label: "Gallery", Icon: Images },
  { to: "/admin/banners", label: "Banners", Icon: ImageIcon },
  { to: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
  { to: "/admin/settings", label: "Contact & Content", Icon: Settings },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Logo />
          <h1 className="mt-8 text-3xl">No admin access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as <strong>{user.email}</strong>, but this account isn't a SARTAJ admin. Ask the store owner to grant access.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="ink" onClick={signOut}>Sign out</Button>
            <Button asChild variant="outline-ink"><Link to="/">Back to website</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, Icon, ...rest }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact: "exact" in rest }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
        >
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col bg-sidebar p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Logo tone="light" />
        <p className="eyebrow mt-2 text-[0.55rem] text-sidebar-foreground/50">Admin dashboard</p>
        <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
        <div className="space-y-2 border-t border-sidebar-border pt-4 text-sm text-sidebar-foreground/70">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-sidebar-foreground"><ExternalLink className="h-4 w-4" /> View website</a>
          <p className="truncate text-xs">{user.email}</p>
          <button type="button" onClick={signOut} className="flex items-center gap-2 hover:text-sidebar-foreground"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Logo tone="light" />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="text-sidebar-foreground"><Menu /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-sidebar p-5 lg:hidden">
          <div className="mb-8 flex items-center justify-between">
            <Logo tone="light" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-sidebar-foreground"><X /></button>
          </div>
          {nav}
          <button type="button" onClick={signOut} className="mt-6 flex items-center gap-2 px-3 text-sm text-sidebar-foreground/70"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      )}
      <div className="min-w-0 p-4 md:p-8 lg:p-10">
        <Outlet />
      </div>
    </div>
  );
}
