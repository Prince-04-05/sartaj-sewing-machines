import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Loader2, Mail, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { STATUSES, StatusBadge, type EnquiryStatus } from "@/components/admin/StatusBadge";
import { formatPhone, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: EnquiriesPage,
});

type Enquiry = {
  id: string; reference: string; name: string; phone: string; email: string | null; city: string;
  product_name: string; enquiry_type: string; message: string; status: EnquiryStatus; admin_notes: string; created_at: string;
};

function EnquiriesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"all" | EnquiryStatus>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data as Enquiry[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<Enquiry, "status" | "admin_notes">> }) => {
      const { error } = await supabase.from("enquiries").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter((e) => (status === "all" || e.status === status) && (!t || [e.name, e.phone, e.city, e.product_name, e.reference, e.email ?? ""].join(" ").toLowerCase().includes(t)));
  }, [data, status, q]);

  function exportCsv() {
    const head = ["Reference", "Date", "Name", "Phone", "Email", "City", "Product", "Type", "Status", "Message", "Notes"];
    const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [head.join(","), ...rows.map((e) => [e.reference, e.created_at, e.name, e.phone, e.email ?? "", e.city, e.product_name, e.enquiry_type, e.status, e.message, e.admin_notes].map(esc).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sartaj-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every enquiry from the website, newest first.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, product…" className="w-44 bg-transparent text-sm outline-none" />
          </label>
          <Button variant="outline-ink" className="rounded-full" onClick={exportCsv}><Download /> Export CSV</Button>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {[{ value: "all", label: "All" } as const, ...STATUSES].map((s) => (
          <button key={s.value} type="button" onClick={() => setStatus(s.value)} className={`rounded-full border px-4 py-1.5 text-sm ${status === s.value ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"}`}>
            {s.label} <span className="opacity-60">({s.value === "all" ? data.length : data.filter((e) => e.status === s.value).length})</span>
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No enquiries match.</p>}
        {rows.map((e) => {
          const open = openId === e.id;
          return (
            <div key={e.id} className="rounded-2xl border border-border bg-card shadow-soft">
              <button type="button" onClick={() => setOpenId(open ? null : e.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
                <div className="min-w-0">
                  <p className="font-semibold">{e.name} <span className="font-normal text-muted-foreground">· {e.city} · {formatPhone(e.phone)}</span></p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.reference} · {e.enquiry_type}{e.product_name ? ` · ${e.product_name}` : ""} · {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </button>
              {open && (
                <div className="grid gap-5 border-t border-border p-4 md:grid-cols-2">
                  <div className="space-y-3 text-sm">
                    {e.email && <p><span className="text-muted-foreground">Email:</span> {e.email}</p>}
                    <p className="whitespace-pre-line rounded-xl bg-secondary p-3">{e.message || <span className="text-muted-foreground">No message</span>}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="ink" className="rounded-full"><a href={telLink(e.phone)}><Phone /> Call</a></Button>
                      <Button asChild size="sm" variant="whatsapp" className="rounded-full">
                        <a href={whatsappLink(e.phone, `Hello ${e.name}, this is SARTAJ Sewing Machines regarding your enquiry ${e.reference}${e.product_name ? ` for ${e.product_name}` : ""}.`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp</a>
                      </Button>
                      {e.email && <Button asChild size="sm" variant="outline-ink" className="rounded-full"><a href={mailtoLink(e.email, `Your SARTAJ enquiry ${e.reference}`)}><Mail /> Email</a></Button>}
                    </div>
                  </div>
                  <NotesEditor enquiry={e} onSave={(patch) => update.mutate({ id: e.id, patch })} onDelete={() => { if (confirm("Delete this enquiry?")) remove.mutate(e.id); }} saving={update.isPending} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesEditor({ enquiry, onSave, onDelete, saving }: { enquiry: Enquiry; onSave: (p: Partial<Pick<Enquiry, "status" | "admin_notes">>) => void; onDelete: () => void; saving: boolean }) {
  const [notes, setNotes] = useState(enquiry.admin_notes);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Status
        <select value={enquiry.status} onChange={(ev) => onSave({ status: ev.target.value as EnquiryStatus })} className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm">
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Internal notes
        <Textarea rows={3} value={notes} onChange={(ev) => setNotes(ev.target.value)} className="mt-1" placeholder="Called on…, visit planned for…" />
      </label>
      <div className="flex justify-between">
        <Button size="sm" variant="ink" className="rounded-full" disabled={saving || notes === enquiry.admin_notes} onClick={() => onSave({ admin_notes: notes })}>Save notes</Button>
        <Button size="sm" variant="ghost" className="rounded-full text-destructive hover:text-destructive" onClick={onDelete}><Trash2 /> Delete</Button>
      </div>
    </div>
  );
}
