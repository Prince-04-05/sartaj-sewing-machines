// Client-safe brand constants, types and link helpers.

export type ContactSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  hours: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

export type ContentSettings = {
  announcement: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutBody: string;
};

export type SiteSettings = { contact: ContactSettings; content: ContentSettings };

export const DEFAULT_SETTINGS: SiteSettings = {
  contact: {
    phone: "9855457616",
    whatsapp: "9878211338",
    email: "mrprince110022@gmail.com",
    address: "Hariana, Punjab, India",
    mapsUrl: "https://maps.app.goo.gl/GkMM8mitAMxYkAJT6",
    lat: 31.6387333,
    lng: 75.8414912,
    hours: "Mon – Sat: 9:00 AM – 8:00 PM",
    instagram: "",
    facebook: "",
    youtube: "",
  },
  content: {
    announcement:
      "Visit our Hariana showroom — expert advice, genuine parts and trusted repair service.",
    heroEyebrow: "Hariana · Punjab",
    heroTitle: "The crown of fine stitching.",
    heroSubtitle:
      "Premium domestic & industrial sewing machines, motors, spare parts and expert repair — chosen and serviced by people who know machines.",
    aboutTitle: "Trusted by tailors across Punjab",
    aboutBody:
      "SARTAJ is a sewing machine specialist in Hariana, Punjab. From classic tailoring machines to high-speed industrial setups, servo motors and every small spare part, we help home tailors, boutiques and garment units choose the right machine — and keep it running for years.",
  },
};

export function mergeSettings(rows: { key: string; value: unknown }[] | null | undefined): SiteSettings {
  const out: SiteSettings = {
    contact: { ...DEFAULT_SETTINGS.contact },
    content: { ...DEFAULT_SETTINGS.content },
  };
  for (const row of rows ?? []) {
    if (row.key === "contact" && row.value && typeof row.value === "object") {
      out.contact = { ...out.contact, ...(row.value as Partial<ContactSettings>) };
    }
    if (row.key === "content" && row.value && typeof row.value === "object") {
      out.content = { ...out.content, ...(row.value as Partial<ContentSettings>) };
    }
  }
  return out;
}

/** Strips spaces, dashes and a leading +91 / 0 so we keep the 10-digit Indian number. */
export function normalizeIndianPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function telLink(phone: string) {
  return `tel:+91${normalizeIndianPhone(phone)}`;
}

export function whatsappLink(phone: string, message?: string) {
  const base = `https://wa.me/91${normalizeIndianPhone(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(email: string, subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const q = params.toString().replace(/\+/g, "%20");
  return `mailto:${email}${q ? `?${q}` : ""}`;
}

export function directionsLink(c: Pick<ContactSettings, "lat" | "lng">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
}

export function mapEmbedSrc(c: Pick<ContactSettings, "lat" | "lng">) {
  return `https://www.google.com/maps?q=${c.lat},${c.lng}&z=16&output=embed`;
}

export function formatPhone(phone: string) {
  const d = normalizeIndianPhone(phone);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
}

export type Spec = { label: string; value: string };

export type ProductDTO = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  features: string[];
  specifications: Spec[];
  images: string[];
  is_featured: boolean;
  is_best_seller: boolean;
  sort_order: number;
  created_at: string;
  category: { id: string; slug: string; name: string; group_name: string } | null;
};

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  group_name: string;
  sort_order: number;
};

export const ENQUIRY_TYPES = [
  "Product Enquiry",
  "Shop Visit",
  "Repair & Service",
  "Spare Parts",
  "Bulk / Business Order",
  "Other",
] as const;

export const SITE_NAME = "SARTAJ";
