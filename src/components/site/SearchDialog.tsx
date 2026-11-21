import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { productsQuery } from "@/lib/queries";

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ ...productsQuery, enabled: open });

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!data) return [];
    if (!term) return data.slice(0, 6);
    return data
      .filter((p) =>
        [p.name, p.short_description, p.category?.name ?? "", ...p.features].join(" ").toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [q, data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-4 w-[calc(100%-2rem)] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 sm:top-[12vh] sm:rounded-2xl">
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onOpenChange(false);
            navigate({ to: "/products", search: { q: q.trim() || undefined } });
          }}
          className="flex items-center gap-3 border-b border-border pl-4 pr-12"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search machines, motors, parts…"
            aria-label="Search products"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </form>
        <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading catalogue…
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">No products match “{q}”. Try another word.</p>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              to="/products/$slug"
              params={{ slug: p.slug }}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary"
            >
              <img src={p.images[0]} alt="" className="h-12 w-12 rounded-md object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.category?.name}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
