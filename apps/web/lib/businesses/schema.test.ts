import { describe, expect, it } from "vitest";
import { parseCreateBusinessInput } from "@/lib/businesses/schema";

function buildFormData(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
}

describe("parseCreateBusinessInput", () => {
  it("accepts valid business input", () => {
    const result = parseCreateBusinessInput(
      buildFormData({
        name: "Acme Roofing",
        industry: "roofing",
        email: "owner@example.com",
        website: "https://acme.example.com",
      }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects missing required name", () => {
    const result = parseCreateBusinessInput(
      buildFormData({
        name: "",
        industry: "roofing",
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name?.[0]).toMatch(/required/i);
    }
  });

  it("rejects invalid optional email and website", () => {
    const result = parseCreateBusinessInput(
      buildFormData({
        name: "Acme Roofing",
        industry: "roofing",
        email: "not-an-email",
        website: "notaurl",
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.email?.[0]).toMatch(/valid email/i);
      expect(fields.website?.[0]).toMatch(/valid url/i);
    }
  });
});
