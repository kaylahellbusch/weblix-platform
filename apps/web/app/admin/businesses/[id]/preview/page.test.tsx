import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PreviewPage from "./page";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { readWebsiteContent } from "@/lib/website-content/repository";
vi.mock("next/font/google", () => ({ Inter: () => ({ className: "inter" }) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not-found"); } }));
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }));
vi.mock("@/lib/businesses/repository", () => ({ getBusinessByIdForOwner: vi.fn() }));
vi.mock("@/lib/website-content/repository", () => ({ readWebsiteContent: vi.fn() }));
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
const props = { params: Promise.resolve({ id }) };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: "owner" } as never);
  vi.mocked(getBusinessByIdForOwner).mockResolvedValue({ id, name: "Example Roofing", phone: "208-555-0100", email: "owner@example.test", city: "Boise", state: "ID", website: "https://example.test" } as never);
  vi.mocked(readWebsiteContent).mockResolvedValue(null);
});
describe("website preview page", () => {
  it("maps stored data into optional sections and safe contact links", async () => {
    vi.mocked(readWebsiteContent).mockResolvedValue({ headline: "Saved headline", introduction: "Saved introduction", services: [{ title: "Repairs", description: "Saved service" }], serviceAreas: ["Meridian"] });
    render(await PreviewPage(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Saved headline");
    expect(screen.getAllByText("Saved introduction")).toHaveLength(2);
    expect(screen.getByText("Saved service")).toBeInTheDocument();
    expect(screen.getAllByText("Meridian")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "owner@example.test" })[0]).toHaveAttribute("href", "mailto:owner%40example.test");
    expect(getBusinessByIdForOwner).toHaveBeenCalledWith({}, id, "owner");
  });
  it("omits absent sections, uses business name, and disables the demo", async () => {
    render(await PreviewPage(props));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Example Roofing");
    expect(screen.queryByRole("heading", { name: "Our Services" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Areas We Serve" })).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByText(/Read-only/)).toBeInTheDocument();
  });
  it("renders hostile text literally and never links unsafe contact values", async () => {
    vi.mocked(getBusinessByIdForOwner).mockResolvedValue({ id, name: "Example", website: "javascript:alert(1)", phone: "javascript:bad", email: "bad" } as never);
    vi.mocked(readWebsiteContent).mockResolvedValue({ headline: "<script>alert(1)</script>", services: [], serviceAreas: [] });
    const { container } = render(await PreviewPage(props));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("<script>alert(1)</script>");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
  it("rejects nonowners and missing businesses before reading content", async () => {
    vi.mocked(getBusinessByIdForOwner).mockResolvedValue(null);
    await expect(PreviewPage(props)).rejects.toThrow("not-found");
    expect(readWebsiteContent).not.toHaveBeenCalled();
  });
  it("requires authentication before looking up data", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("redirect:/login"));
    await expect(PreviewPage(props)).rejects.toThrow("redirect:/login");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
    expect(readWebsiteContent).not.toHaveBeenCalled();
  });
  it("rejects malformed IDs before looking up data", async () => {
    await expect(PreviewPage({ params: Promise.resolve({ id: "bad" }) })).rejects.toThrow("not-found");
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
  });
  it("propagates content load failures rather than presenting missing content", async () => {
    vi.mocked(readWebsiteContent).mockRejectedValue(new Error("Unable to load website content."));
    await expect(PreviewPage(props)).rejects.toThrow("Unable to load website content.");
  });
});
