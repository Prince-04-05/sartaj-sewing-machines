import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadMedia(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 10 * 1024 * 1024) throw new Error("Image must be under 10 MB");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (signErr || !data) throw signErr ?? new Error("Could not create image link");
  return data.signedUrl;
}

export function ImageListInput({
  value,
  onChange,
  folder,
  multiple = true,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  folder: string;
  multiple?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadMedia(f, folder));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
      toast.success(urls.length > 1 ? `${urls.length} images uploaded` : "Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={src + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border">
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && multiple && <span className="absolute bottom-1 left-1 rounded bg-ink px-1.5 text-[0.6rem] text-ink-foreground">Main</span>}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-ink-foreground"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {i > 0 && multiple && (
              <button
                type="button"
                onClick={() => onChange([src, ...value.filter((_, j) => j !== i)])}
                className="absolute inset-x-1 bottom-1 hidden rounded bg-gold text-[0.6rem] font-semibold text-gold-foreground group-hover:block"
              >
                Make main
              </button>
            )}
          </div>
        ))}
        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-gold hover:text-foreground"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image link"
          className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            if (!url.trim()) return;
            onChange(multiple ? [...value, url.trim()] : [url.trim()]);
            setUrl("");
          }}
          className="rounded-lg border border-border px-3 text-sm hover:border-gold"
        >
          Add
        </button>
      </div>
    </div>
  );
}
