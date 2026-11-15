import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageListInput } from "./ImageUpload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (t: string) => any };

export type Row = Record<string, unknown> & { id: string };
type FormValues = Record<string, unknown>;

export type Field =
  | { name: string; label: string; type: "text" | "number" | "textarea"; required?: boolean; hint?: string; rows?: number }
  | { name: string; label: string; type: "switch"; hint?: string }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean; hint?: string }
  | { name: string; label: string; type: "images"; folder: string; multiple?: boolean; hint?: string };

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export function CrudPage({
  table,
  title,
  description,
  select = "*",
  orderBy = "sort_order",
  fields,
  defaults,
  toForm = (r) => ({ ...r }),
  fromForm = (v) => v,
  renderRow,
  searchText,
  layout = "list",
  autoSlug,
}: {
  table: string;
  title: string;
  description?: string;
  select?: string;
  orderBy?: string;
  fields: Field[];
  defaults: FormValues;
  toForm?: (r: Row) => FormValues;
  fromForm?: (v: FormValues) => FormValues;
  renderRow: (r: Row) => ReactNode;
  searchText?: (r: Row) => string;
  layout?: "list" | "grid";
  autoSlug?: { from: string; to: string };
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const { data = [], isLoading, error } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await db.from(table).select(select).order(orderBy, { ascending: true });
      if (error) throw error;
      return data as Row[];
    },
  });

  const [editing, setEditing] = useState<{ id: string | null; values: FormValues } | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [q, setQ] = useState("");

  const save = useMutation({
    mutationFn: async ({ id, values }: { id: string | null; values: FormValues }) => {
      const payload = fromForm(values);
      for (const f of fields) {
        if ("required" in f && f.required && !String(payload[f.name] ?? "").trim()) throw new Error(`${f.label} is required`);
      }
      const res = id ? await db.from(table).update(payload).eq("id", id) : await db.from(table).insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message.includes("duplicate") ? "That URL name (slug) is already used" : e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t || !searchText) return data;
    return data.filter((r) => searchText(r).toLowerCase().includes(t));
  }, [data, q, searchText]);

  function set(name: string, v: unknown) {
    setEditing((e) => {
      if (!e) return e;
      const values = { ...e.values, [name]: v };
      if (autoSlug && name === autoSlug.from && !e.id) values[autoSlug.to] = slugify(String(v));
      return { ...e, values };
    });
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex gap-2">
          {searchText && (
            <label className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-40 bg-transparent text-sm outline-none" />
            </label>
          )}
          <Button variant="gold" className="rounded-full" onClick={() => setEditing({ id: null, values: { ...defaults } })}>
            <Plus /> Add new
          </Button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>}
        {error && <p className="text-sm text-destructive">Could not load: {(error as Error).message}</p>}
        {!isLoading && rows.length === 0 && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>}
        <div className={layout === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-3"}>
          {rows.map((r) => (
            <div key={r.id} className="group relative rounded-2xl border border-border bg-card p-4 shadow-soft">
              {renderRow(r)}
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Button size="sm" variant="outline-ink" className="rounded-full" onClick={() => setEditing({ id: r.id, values: toForm(r) })}>
                  <Pencil /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
                  <Trash2 /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{editing?.id ? `Edit ${title.replace(/s$/, "").toLowerCase()}` : `Add ${title.replace(/s$/, "").toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              id="crud-form"
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate(editing);
              }}
            >
              {fields.map((f) => {
                const v = editing.values[f.name];
                const id = `f-${f.name}`;
                return (
                  <div key={f.name} className="space-y-2">
                    {f.type === "switch" ? (
                      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                        <div>
                          <Label htmlFor={id}>{f.label}</Label>
                          {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                        </div>
                        <Switch id={id} checked={!!v} onCheckedChange={(c) => set(f.name, c)} />
                      </div>
                    ) : (
                      <>
                        <Label htmlFor={id}>{f.label}{"required" in f && f.required ? " *" : ""}</Label>
                        {f.type === "text" && <Input id={id} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />}
                        {f.type === "number" && <Input id={id} type="number" value={String(v ?? 0)} onChange={(e) => set(f.name, Number(e.target.value))} />}
                        {f.type === "textarea" && <Textarea id={id} rows={f.rows ?? 4} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} />}
                        {f.type === "select" && (
                          <select id={id} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">— Select —</option>
                            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        )}
                        {f.type === "images" && (
                          <ImageListInput folder={f.folder} multiple={f.multiple ?? true} value={(v as string[]) ?? []} onChange={(x) => set(f.name, x)} />
                        )}
                        {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                      </>
                    )}
                  </div>
                );
              })}
            </form>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="crud-form" variant="ink" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
