import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { enquirySchema, type EnquiryInput, type EnquiryParsed } from "@/lib/enquiry-schema";
import { submitEnquiry } from "@/lib/enquiry.functions";
import { ENQUIRY_TYPES, type ProductDTO } from "@/lib/site";
import { EnquiryConfirmation, type EnquirySummary } from "./EnquiryConfirmation";

type Props = {
  product?: Pick<ProductDTO, "id" | "name"> | null;
  products?: Pick<ProductDTO, "id" | "name">[];
  defaultType?: (typeof ENQUIRY_TYPES)[number];
  compact?: boolean;
};

export function EnquiryForm({ product, products = [], defaultType = "Product Enquiry", compact }: Props) {
  const [summary, setSummary] = useState<EnquirySummary | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const startedAt = useRef(0);
  const submit = useServerFn(submitEnquiry);

  const form = useForm<EnquiryInput, unknown, EnquiryParsed>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      productId: product?.id ?? null,
      productName: product?.name ?? "",
      enquiryType: product ? "Product Enquiry" : defaultType,
      message: "",
      website: "",
      elapsedMs: 0,
    },
  });

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (product) {
      form.setValue("productId", product.id);
      form.setValue("productName", product.name);
    }
  }, [product, form]);

  const { register, handleSubmit, formState, setValue, watch } = form;
  const errors = formState.errors;
  const selectedProductId = watch("productId");

  async function onSubmit(values: EnquiryParsed) {
    setServerError(null);
    try {
      const elapsedMs = startedAt.current ? Math.max(0, Math.round(Date.now() - startedAt.current)) : 0;
      const res = await submit({ data: { ...values, elapsedMs } });
      if (!res.ok) {
        setServerError(res.error);
        toast.error(res.error);
        return;
      }
      const parsed = values;
      setSummary({
        reference: res.reference,
        createdAt: res.createdAt,
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email,
        city: parsed.city,
        productName: values.productName || products.find((p) => p.id === values.productId)?.name || "",
        enquiryType: parsed.enquiryType,
        message: parsed.message ?? "",
      });
      toast.success("Enquiry sent — we'll be in touch soon.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      const msg = "Could not send your enquiry. Please check your connection or call us.";
      setServerError(msg);
      toast.error(msg);
    }
  }

  if (summary) {
    return (
      <EnquiryConfirmation
        summary={summary}
        onReset={() => {
          setSummary(null);
          form.reset();
          startedAt.current = Date.now();
        }}
      />
    );
  }

  const field = "h-12 rounded-xl bg-background text-base sm:text-sm";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={compact ? "space-y-4" : "space-y-5 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6 md:p-8"}
    >
      {/* Honeypot: hidden from people, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="new-password" {...register("website")} />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="enq-name">Full name *</Label>
          <Input id="enq-name" autoComplete="name" className={field} {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enq-phone">Phone number *</Label>
          <Input id="enq-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" className={field} {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enq-email">Email</Label>
          <Input id="enq-email" type="email" autoComplete="email" placeholder="Optional" className={field} {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enq-city">City / Location *</Label>
          <Input id="enq-city" autoComplete="address-level2" className={field} {...register("city")} aria-invalid={!!errors.city} />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enq-product">Interested product</Label>
          {product ? (
            <Input id="enq-product" readOnly value={product.name} className={field} />
          ) : (
            <select
              id="enq-product"
              className={`${field} w-full min-w-0 border border-input px-3`}
              value={selectedProductId ?? ""}
              onChange={(e) => {
                const id = e.target.value || null;
                setValue("productId", id);
                setValue("productName", products.find((p) => p.id === id)?.name ?? "");
              }}
            >
              <option value="">Not sure yet / General</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enq-type">Enquiry type *</Label>
          <select id="enq-type" className={`${field} w-full min-w-0 border border-input px-3`} {...register("enquiryType")}>
            {ENQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="enq-msg">Message</Label>
        <Textarea id="enq-msg" rows={4} className="rounded-xl bg-background text-base sm:text-sm" placeholder="Tell us what you need — machine type, quantity, repair issue, preferred visit time…" {...register("message")} />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      {serverError && (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <Button type="submit" variant="gold" size="xl" className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        {formState.isSubmitting ? "Sending enquiry…" : "Send Enquiry"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No online payment. We'll contact you and welcome you at our Hariana shop.
      </p>
    </form>
  );
}
