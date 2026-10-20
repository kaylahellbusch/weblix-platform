import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveContentAction } from "./actions";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { saveWebsiteContent } from "@/lib/website-content/repository";
import { revalidatePath } from "next/cache";

vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); }, notFound: () => { throw new Error("not-found"); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }));
vi.mock("@/lib/businesses/repository", () => ({ getBusinessByIdForOwner: vi.fn() }));
vi.mock("@/lib/website-content/repository", () => ({ saveWebsiteContent: vi.fn() }));
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
function form(content: unknown) { const data = new FormData(); data.set("content", JSON.stringify(content)); return data; }
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: "owner" } as never);
  vi.mocked(getBusinessByIdForOwner).mockResolvedValue({ id } as never);
});
describe("content action", () => {
  it.each([
    { headline: "x".repeat(161) }, { introduction: "x".repeat(2001) },
    { services: Array.from({ length: 21 }, () => ({ title: "Roof", description: "Repair" })) },
    { serviceAreas: Array(51).fill("Example City") }, { theme: "forbidden" },
    { services: [{ title: " ", description: "Repair", price: 1 }] }, { serviceAreas: [""] },
  ])("rejects invalid or unknown content without writing: %j", async content => {
    const result = await saveContentAction(id, {}, form(content));
    expect(result.errors?.length).toBeGreaterThan(0);
    expect(saveWebsiteContent).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it("authenticates before processing even invalid input", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("redirect:/login"));
    await expect(saveContentAction(id, {}, form(null))).rejects.toThrow("redirect:/login");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
    expect(saveWebsiteContent).not.toHaveBeenCalled();
  });
  it("hides missing/nonowned business and never writes", async () => {
    vi.mocked(getBusinessByIdForOwner).mockResolvedValue(null);
    await expect(saveContentAction(id, {}, form({}))).rejects.toThrow("not-found");
    expect(getBusinessByIdForOwner).toHaveBeenCalledWith({}, id, "owner");
    expect(saveWebsiteContent).not.toHaveBeenCalled();
  });
  it("rejects malformed IDs", async () => {
    await expect(saveContentAction("invalid", {}, form({}))).rejects.toThrow("not-found");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
  });
  it("rejects malformed payloads without writing", async () => {
    const data = new FormData(); data.set("content", "{");
    expect((await saveContentAction(id, {}, data)).formError).toMatch(/invalid/i);
    expect(saveWebsiteContent).not.toHaveBeenCalled();
  });
  it("saves canonical content in submitted order and reports success only after saving", async () => {
    const content = { headline: " Headline ", services: [{ title: "Second", description: "Repair" }, { title: "First", description: "Replace" }], serviceAreas: ["B", "A"] };
    expect(await saveContentAction(id, {}, form(content))).toEqual({ saved: true });
    expect(saveWebsiteContent).toHaveBeenCalledWith({}, id, { ...content, headline: "Headline" });
    expect(revalidatePath).toHaveBeenCalledWith(`/admin/businesses/${id}/content`);
  });
  it("clears optional content with a valid empty document", async () => {
    expect(await saveContentAction(id, {}, form({}))).toEqual({ saved: true });
    expect(saveWebsiteContent).toHaveBeenCalledWith({}, id, { services: [], serviceAreas: [] });
  });
  it("provides a safe retry error when access lookup fails", async () => {
    vi.mocked(getBusinessByIdForOwner).mockRejectedValue(new Error("private database detail"));
    expect(await saveContentAction(id, {}, form({}))).toEqual({ formError: "We could not check access. Please try again." });
    expect(saveWebsiteContent).not.toHaveBeenCalled();
  });
  it("provides a safe retry error when saving fails", async () => {
    vi.mocked(saveWebsiteContent).mockRejectedValue(new Error("private database detail"));
    expect((await saveContentAction(id, {}, form({}))).formError).toMatch(/could not save/i);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
