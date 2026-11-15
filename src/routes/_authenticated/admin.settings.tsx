import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { mergeSettings, type SiteSettings } from "@/lib/site";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const CONTACT_FIELDS: [keyof SiteSettings["contact"], string][] = [
  ["phone", "Call number"], ["whatsapp", "WhatsApp number"], ["email", "Business email"], ["address", "Address"],
  ["hours", "Opening hours"], ["mapsUrl", "Google Maps link"], ["lat", "Map latitude"], ["lng", "Map longitude"],
  ["instagram", "Instagram link"], ["facebook", "Facebook link"], ["youtube", "YouTube link"],
];
const CONTENT_FIELDS: [keyof SiteSettings["content"], string, boolean][] = [
  ["announcement", "Announcement bar", false], ["heroEyebrow", "Hero small label", false], ["heroTitle", "Hero headline", false],
  ["heroSubtitle", "Hero sub-text", true], ["aboutTitle", "About heading", false], ["aboutBody", "About text", true],
];

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => mergeSettings((await supabase.from("site_settings").select("key, value")).data as { key: string; value: unknown }[]),
  });
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { if (data) setS(data); }, [data]);

  const save = useMutation({
    mutationFn: async (v: SiteSettings) => {
      const contact = { ...v.contact, lat: Number(v.contact.lat), lng: Number(v.contact.lng) };
      const { error } = await supabase.from("site_settings").upsert([
        { key: "contact", value: contact as unknown as Json },
        { key: "content", value: v.content as unknown as Json },
      ]);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Website details saved"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!s) return <Loader2 className="h-5 w-5 animate-spin text-gold" />;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(s); }} className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-4xl">Contact & content</h1>
        <p className="mt-1 text-sm text-muted-foreground">These details appear across the whole website — header, footer, buttons and map.</p>
      </div>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-2xl">Business contact</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`c-${k}`}>{label}</Label>
              <Input id={`c-${k}`} value={String(s.contact[k] ?? "")} onChange={(e) => setS({ ...s, contact: { ...s.contact, [k]: e.target.value } })} />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-2xl">Website text</h2>
        <div className="mt-5 space-y-4">
          {CONTENT_FIELDS.map(([k, label, long]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={`t-${k}`}>{label}</Label>
              {long ? (
                <Textarea id={`t-${k}`} rows={3} value={s.content[k]} onChange={(e) => setS({ ...s, content: { ...s.content, [k]: e.target.value } })} />
              ) : (
                <Input id={`t-${k}`} value={s.content[k]} onChange={(e) => setS({ ...s, content: { ...s.content, [k]: e.target.value } })} />
              )}
            </div>
          ))}
        </div>
      </section>
      <Button type="submit" variant="gold" size="xl" disabled={save.isPending}>
        {save.isPending && <Loader2 className="animate-spin" />} Save changes
      </Button>
    </form>
  );
}
