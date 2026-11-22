import { z } from "zod";
import { ENQUIRY_TYPES, normalizeIndianPhone } from "./site";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .transform(normalizeIndianPhone)
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number"),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email"),
  city: z.string().trim().min(2, "Please enter your city / location").max(80),
  productId: z.string().uuid().optional().nullable(),
  productName: z.string().trim().max(160).optional().default(""),
  enquiryType: z.enum(ENQUIRY_TYPES),
  message: z.string().trim().max(1500).optional().default(""),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryParsed = z.output<typeof enquirySchema>;

