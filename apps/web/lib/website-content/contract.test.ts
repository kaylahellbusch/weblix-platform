import { expect, it } from "vitest";
import { websiteContentSchema as schema } from "./schema";
import { toWebsitePreview } from "./preview";
import { exampleBusiness, businessWithoutContacts, populatedContent } from "./fixtures";

it("normalizes blank text and defaults arrays", () => {
  expect(schema.parse({ headline: " ", introduction: "\n" })).toEqual({ headline: undefined, introduction: undefined, services: [], serviceAreas: [] });
  expect(schema.parse({})).toEqual({ services: [], serviceAreas: [] });
  expect(schema.parse({ headline: " Roofs " }).headline).toBe("Roofs");
  expect(schema.parse({ headline: "<b>Roof</b>" }).headline).toBe("<b>Roof</b>");
});
it.each([
  null, [], { headline: null }, { headline: 3 }, { introduction: false },
  { services: null }, { serviceAreas: "City" }, { name: "duplicate" },
  { services: [{ title: "a", description: "b", extra: true }] },
  { services: [{ title: " ", description: "b" }] },
  { services: [{ title: "a", description: " " }] }, { serviceAreas: [""] },
  { serviceAreas: [3] }, { headline: "a".repeat(161) },
  { introduction: "a".repeat(2001) },
  { services: [{ title: "a".repeat(121), description: "b" }] },
  { services: [{ title: "a", description: "b".repeat(1001) }] },
  { serviceAreas: ["a".repeat(121)] },
  { services: Array.from({ length: 21 }, () => ({ title: "a", description: "b" })) },
  { serviceAreas: Array(51).fill("City") },
])("rejects invalid content %j", (value) => expect(schema.safeParse(value).success).toBe(false));
it("accepts inclusive boundaries", () => {
  expect(schema.safeParse({ headline: "a".repeat(160), introduction: "a".repeat(2000),
    services: Array.from({ length: 20 }, () => ({ title: "a".repeat(120), description: "b".repeat(1000) })),
    serviceAreas: Array(50).fill("a".repeat(120)),
  }).success).toBe(true);
});
it("omits absent sections and actions", () => {
  for (const content of [undefined, {}, { headline: " ", introduction: " " }]) {
    expect(toWebsitePreview(businessWithoutContacts, content)).toEqual({ business: businessWithoutContacts, headline: exampleBusiness.name, actions: {} });
  }
});
it("maps ordered content and facts without mutation", () => {
  const before = structuredClone({ exampleBusiness, populatedContent });
  const result = toWebsitePreview(exampleBusiness, populatedContent);
  expect(result).toMatchObject({ business: exampleBusiness, ...populatedContent });
  expect(result.actions).toEqual({ phone: "tel:+12085550100", email: "mailto:hello%40example.com", website: "https://example.com" });
  result.services?.reverse();
  result.business.name = "Changed";
  expect({ exampleBusiness, populatedContent }).toEqual(before);
});
it.each(["javascript:alert(1)", "ftp://example.com", "not a URL", " "])("suppresses unsafe website %s", (website) => {
  expect(toWebsitePreview({ ...businessWithoutContacts, website }).actions).toEqual({});
});
it.each(["call us", "123?x=1", "++123", " "])("suppresses invalid phone %s", (phone) => {
  expect(toWebsitePreview({ ...businessWithoutContacts, phone }).actions).toEqual({});
});
it.each(["bad", "x@example.com?subject=spam", "a@example.com\r\nBcc:b@example.com", " "])("suppresses invalid email %s", (email) => {
  expect(toWebsitePreview({ ...businessWithoutContacts, email }).actions).toEqual({});
});
it("fails clearly on invalid supplied content", () => {
  expect(() => toWebsitePreview(exampleBusiness, { headline: 4 })).toThrow();
  expect(() => toWebsitePreview(exampleBusiness, null)).toThrow();
});

it("selects only public business facts even when given a full stored record", () => {
  const record = { ...exampleBusiness, id: "synthetic-id", owner_id: "synthetic-owner" };
  expect(toWebsitePreview(record).business).toEqual(exampleBusiness);
});
