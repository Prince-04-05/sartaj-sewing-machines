import { describe, expect, it } from "vitest";
import { enquirySchema, isLikelySpam, isTooFast } from "@/lib/enquiry-schema";
import { telLink, whatsappLink, DEFAULT_SETTINGS } from "@/lib/site";

const base = {
  name: "Gurpreet Singh",
  phone: "98554 57616",
  city: "Hoshiarpur",
  enquiryType: "Product Enquiry" as const,
  elapsedMs: 5000,
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

  it("treats a filled honeypot field as spam", () => {
    expect(isLikelySpam({ website: "http://spam", elapsedMs: 10_000 })).toBe(true);
    expect(isLikelySpam({ website: "", elapsedMs: 10_000 })).toBe(false);
  });

  it("flags forms submitted in under 2.5 seconds", () => {
    expect(isTooFast(1000)).toBe(true);
    expect(isTooFast(3000)).toBe(false);
  });

  it("does not depend on the visitor's clock matching the server", () => {
    // Only the time spent on the form matters, not the device's date/time.
    expect(isLikelySpam({ website: "", elapsedMs: 4000 })).toBe(false);
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
