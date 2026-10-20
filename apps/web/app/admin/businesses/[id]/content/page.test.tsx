import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentPage from "./page";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { readWebsiteContent } from "@/lib/website-content/repository";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not-found"); } }));
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }));
vi.mock("@/lib/businesses/repository", () => ({ getBusinessByIdForOwner: vi.fn() }));
vi.mock("@/lib/website-content/repository", () => ({ readWebsiteContent: vi.fn() }));
vi.mock("./actions", () => ({ saveContentAction: vi.fn() }));
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
const props = { params: Promise.resolve({ id }) };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: "owner" } as never);
  vi.mocked(getBusinessByIdForOwner).mockResolvedValue({ id, name: "Example Roofing" } as never);
  vi.mocked(readWebsiteContent).mockResolvedValue(null);
});
describe("content page", () => {
  it("opens a compatible empty editor for a business with no content", async () => {
    render(await ContentPage(props));
    expect(screen.getByLabelText(/Headline/)).toHaveValue("");
    expect(screen.getByText("No services added.")).toBeInTheDocument();
    expect(getBusinessByIdForOwner).toHaveBeenCalledWith({}, id, "owner");
  });
  it("loads saved literal text and ordered sections", async () => {
    vi.mocked(readWebsiteContent).mockResolvedValue({ headline: "<script>literal</script>", services: [{ title: "Second", description: "Repair" }, { title: "First", description: "Replace" }], serviceAreas: ["B", "A"] });
    render(await ContentPage(props));
    expect(screen.getByLabelText(/Headline/)).toHaveValue("<script>literal</script>");
    expect(screen.getByLabelText(/Service 1 title/)).toHaveValue("Second");
    expect(screen.getByLabelText(/Service area 1 \(/)).toHaveValue("B");
  });
  it("rejects nonowners before reading content", async () => {
    vi.mocked(getBusinessByIdForOwner).mockResolvedValue(null);
    await expect(ContentPage(props)).rejects.toThrow("not-found");
    expect(readWebsiteContent).not.toHaveBeenCalled();
  });
  it("requires authentication", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("redirect:/login"));
    await expect(ContentPage(props)).rejects.toThrow("redirect:/login");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
  });
  it("rejects malformed IDs", async () => {
    await expect(ContentPage({ ...props, params: Promise.resolve({ id: "bad" }) })).rejects.toThrow("not-found");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
  });
});
