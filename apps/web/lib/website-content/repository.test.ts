import { describe, expect, it, vi } from "vitest";
import { readWebsiteContent, saveWebsiteContent } from "./repository";
function mockClient(data: unknown = null, error: unknown = null) {
  const maybeSingle = vi.fn(async () => ({ data, error }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn(async () => ({ error }));
  const from = vi.fn(() => ({ select, upsert }));
  return { client: { from } as unknown as Parameters<typeof readWebsiteContent>[0], from, eq, upsert };
}
describe("content repository", () => {
  it("returns null for no visible content and filters by business", async () => {
    const { client, eq } = mockClient();
    expect(await readWebsiteContent(client, "business")).toBeNull();
    expect(eq).toHaveBeenCalledWith("business_id", "business");
  });
  it("validates loaded data rather than blindly casting JSON", async () => {
    const { client } = mockClient({ content: { theme: "invalid" } });
    await expect(readWebsiteContent(client, "business")).rejects.toThrow();
  });
  it("upserts a whole canonical document using the unique business key", async () => {
    const { client, upsert } = mockClient();
    await saveWebsiteContent(client, "business", { headline: " Roof " });
    expect(upsert).toHaveBeenCalledWith({ business_id: "business", content: { headline: "Roof", services: [], serviceAreas: [] } }, { onConflict: "business_id" });
  });
  it("validates before any database call", async () => {
    const { client, from } = mockClient();
    await expect(saveWebsiteContent(client, "business", { owner_id: "forged" })).rejects.toThrow();
    expect(from).not.toHaveBeenCalled();
  });
  it("hides database error details on reads and writes", async () => {
    const { client } = mockClient(null, { message: "private detail" });
    await expect(readWebsiteContent(client, "business")).rejects.toThrow("Unable to load website content.");
    await expect(saveWebsiteContent(client, "business", {})).rejects.toThrow("Unable to save website content.");
  });
});
