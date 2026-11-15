import { describe, expect, it } from "vitest";
import { isSubdomainUniqueViolation, publishingSchema, RESERVED_SUBDOMAINS, subdomainSchema } from "./publishing";

describe("subdomain validation", () => {
  it.each(["abc", "123", "roof-123", "a".repeat(40)])("accepts %s unchanged", (value) => {
    expect(subdomainSchema.parse(value)).toBe(value);
  });
  it.each(["ab", "a".repeat(41), "-abc", "abc-", "ab--cd", "ABC", " abc", "abc ", "ab_cd", "a.b", ...RESERVED_SUBDOMAINS])("rejects %s", (value) => {
    expect(subdomainSchema.safeParse(value).success).toBe(false);
  });
  it("allows clearing only when unpublished", () => {
    expect(publishingSchema.parse({ subdomain: "", published: false })).toEqual({ subdomain: null, published: false });
    expect(publishingSchema.safeParse({ subdomain: "", published: true }).success).toBe(false);
  });
  it("identifies only the subdomain unique constraint", () => {
    expect(isSubdomainUniqueViolation({ code: "23505", message: 'duplicate key value violates unique constraint "businesses_subdomain_key"' })).toBe(true);
    for (const error of [{ code: "23505", message: 'constraint "other_key"' }, { code: "23514", message: '"businesses_subdomain_key"' }, {}]) {
      expect(isSubdomainUniqueViolation(error)).toBe(false);
    }
  });
});
