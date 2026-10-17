import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { updateBusinessAction, deleteBusinessAction } from "./actions";
import { updateBusinessForCurrentUser, deleteBusinessForCurrentUser } from "@/lib/businesses/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("next/navigation", () => ({
  redirect: (path: string) => { throw new Error(`redirect:${path}`); },
  notFound: () => { throw new Error("not-found"); },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/businesses/service", () => ({
  updateBusinessForCurrentUser: vi.fn(), deleteBusinessForCurrentUser: vi.fn(),
}));
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
function form(fields: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({ name: "Acme Updated", industry: "roofing", confirm: "delete", ...fields })
    .forEach(([key, value]) => data.set(key, value));
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
});

describe("update business action", () => {
  it("returns field errors and values without writing invalid input", async () => {
    const result = await updateBusinessAction(id, {}, form({ name: "", industry: "", email: "invalid", website: "invalid" }));
    expect(result.fieldErrors).toMatchObject({ name: expect.any(String), industry: expect.any(String), email: expect.any(String), website: expect.any(String) });
    expect(result.values?.email).toBe("invalid");
    expect(updateBusinessForCurrentUser).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("forwards all editable fields with trimmed values and ignores client ownership", async () => {
    vi.mocked(updateBusinessForCurrentUser).mockResolvedValue({ status: "success" });
    await expect(updateBusinessAction(id, {}, form({ name: " Updated ", industry: " plumbing ", phone: " 555-0100 ", email: "owner@example.com", website: "https://example.com", city: " Boise ", state: " ID ", owner_id: "forged-owner" }))).rejects.toThrow(`redirect:/admin/businesses/${id}`);
    expect(updateBusinessForCurrentUser).toHaveBeenCalledWith({}, id, {
      name: "Updated", industry: "plumbing", phone: "555-0100", email: "owner@example.com", website: "https://example.com", city: "Boise", state: "ID",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/businesses/${id}`);
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/businesses/${id}/edit`);
  });

  it("preserves submitted values and gives a retry message on persistence failure", async () => {
    vi.mocked(updateBusinessForCurrentUser).mockResolvedValue({ status: "error" });
    const result = await updateBusinessAction(id, {}, form({ city: "Boise" }));
    expect(result.values?.city).toBe("Boise");
    expect(result.formError).toMatch(/could not save.*try again/i);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("delete business action", () => {
  it.each(["", "yes", "false"])("refuses to delete without explicit confirmation (%s)", async (confirm) => {
    expect(await deleteBusinessAction(id, {}, form({ confirm }))).toMatchObject({ formError: expect.stringMatching(/confirm/i) });
    expect(deleteBusinessForCurrentUser).not.toHaveBeenCalled();
  });

  it("deletes only after confirmation and refreshes list and business routes before redirect", async () => {
    vi.mocked(deleteBusinessForCurrentUser).mockResolvedValue({ status: "success" });
    await expect(deleteBusinessAction(id, {}, form())).rejects.toThrow("redirect:/admin");
    expect(deleteBusinessForCurrentUser).toHaveBeenCalledWith({}, id);
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/businesses/${id}`, "layout");
  });

  it("returns a safe retry message on delete failure", async () => {
    vi.mocked(deleteBusinessForCurrentUser).mockResolvedValue({ status: "error" });
    expect(await deleteBusinessAction(id, {}, form())).toMatchObject({ formError: expect.stringMatching(/could not delete.*try again/i) });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

for (const operation of ["update", "delete"] as const) {
  const run = (businessId = id) => operation === "update" ? updateBusinessAction(businessId, {}, form()) : deleteBusinessAction(businessId, {}, form());
  const service = operation === "update" ? updateBusinessForCurrentUser : deleteBusinessForCurrentUser;
  describe(`${operation} access boundaries`, () => {
    it("redirects unauthenticated requests to login", async () => {
      vi.mocked(service).mockResolvedValue({ status: "unauthenticated" });
      await expect(run()).rejects.toThrow("redirect:/login");
      expect(revalidatePath).not.toHaveBeenCalled();
    });
    it("returns not found for missing or other-owner records", async () => {
      vi.mocked(service).mockResolvedValue({ status: "not-found" });
      await expect(run()).rejects.toThrow("not-found");
      expect(revalidatePath).not.toHaveBeenCalled();
    });
    it("rejects malformed IDs before querying", async () => {
      await expect(run("invalid-id")).rejects.toThrow("not-found");
      expect(service).not.toHaveBeenCalled();
      expect(createSupabaseServerClient).not.toHaveBeenCalled();
    });
  });
}
