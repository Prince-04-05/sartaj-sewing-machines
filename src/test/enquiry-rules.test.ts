import { describe, expect, it } from "vitest";
import { enquirySchema, isTooFast } from "@/lib/enquiry-schema";
import { telLink, whatsappLink, DEFAULT_SETTINGS } from "@/lib/site";

const base = {
  name: "Gurpreet Singh",
  phone: "98554 57616",
  city: "Hoshiarpur",
  enquiryType: "Product Enquiry" as const,
  startedAt: 0,
};

describe("enquiry rules", () => {
  it("accepts a valid 10-digit Indian mobile and normalises +91", () => {
    const r = enquirySchema.safeParse({ ...base, phone: "+91 98785-11338" });
    expect(r.success && r.data.phone).toBe("9878511338");
  });

  it("rejects a short phone number", () => {
    expect(enquirySchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
  });

  it("requires city / location", () => {
    expect(enquirySchema.safeParse({ ...base, city: "" }).success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    expect(enquirySchema.safeParse({ ...base, website: "http://spam" }).success).toBe(false);
  });

  it("flags forms submitted in under 2.5 seconds", () => {
    expect(isTooFast(1000, 2000)).toBe(true);
    expect(isTooFast(1000, 4000)).toBe(false);
  });
});

describe("business contact links", () => {
  it("calls 9855457616", () => {
    expect(telLink(DEFAULT_SETTINGS.contact.phone)).toBe("tel:+919855457616");
  });
  it("messages WhatsApp 9878211338", () => {
    expect(whatsappLink(DEFAULT_SETTINGS.contact.whatsapp)).toBe("https://wa.me/919878211338");
  });
  it("uses the business email", () => {
    expect(DEFAULT_SETTINGS.contact.email).toBe("mrprince110022@gmail.com");
  });
});
