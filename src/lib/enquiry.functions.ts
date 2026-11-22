import { createServerFn } from "@tanstack/react-start";
import { enquirySchema } from "./enquiry-schema";

export type EnquiryResult =
  | { ok: true; reference: string; createdAt: string }
  | { ok: false; error: string };

const RATE_WINDOW_MIN = 15;
// Spam protection: at most RATE_MAX enquiries per phone number in the window.
// (Hidden-field and fill-speed checks were removed: autofill and form-filler tools tripped them for real people.)
const RATE_MAX = 5;

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const parsed = enquirySchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form" };
    }
    const e = parsed.data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - RATE_WINDOW_MIN * 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("phone", e.phone)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_MAX) {
      return { ok: false, error: "We've already received your enquiries. Please call or WhatsApp us directly." };
    }

    let productName = e.productName ?? "";
    let productId: string | null = e.productId ?? null;
    if (productId) {
      const { data: prod } = await supabaseAdmin.from("products").select("id, name").eq("id", productId).maybeSingle();
      if (prod) productName = prod.name;
      else productId = null;
    }

    const { data: row, error } = await supabaseAdmin
      .from("enquiries")
      .insert({
        name: e.name,
        phone: e.phone,
        email: e.email ?? null,
        city: e.city,
        product_id: productId,
        product_name: productName,
        enquiry_type: e.enquiryType,
        message: e.message ?? "",
      })
      .select("reference, created_at")
      .single();

    if (error || !row) {
      console.error("enquiry insert failed", error?.message);
      return { ok: false, error: "Something went wrong saving your enquiry. Please call us instead." };
    }

    // Email notifications activate once a sender domain is verified (see AGENTS.md).

    return { ok: true, reference: row.reference, createdAt: row.created_at };
  });
