import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import BusinessDetailPage from "./page";
import EditBusinessPage from "./edit/page";
import BusinessSettingsPage from "./settings/page";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner, type Business } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("not-found"); } }));
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
vi.mock("@/lib/businesses/repository", () => ({ getBusinessByIdForOwner: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("./actions", () => ({ updateBusinessAction: vi.fn(), deleteBusinessAction: vi.fn() }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute("open"); });
});
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
const business: Business = { id, owner_id: "owner-1", name: "Acme", industry: "roofing", phone: null, email: null, website: null, city: "Boise", state: "ID", created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: "owner-1" } as never);
  vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
  vi.mocked(getBusinessByIdForOwner).mockResolvedValue(business);
});
for (const [name, Page] of [["detail", BusinessDetailPage], ["edit", EditBusinessPage], ["settings", BusinessSettingsPage]] as const) {
  describe(`${name} page access`, () => {
    it("reads the business with the server-authenticated owner", async () => {
      await Page({ params: Promise.resolve({ id }) });
      expect(getBusinessByIdForOwner).toHaveBeenCalledWith({}, id, "owner-1");
    });
    it("returns not found for missing or inaccessible records", async () => {
      vi.mocked(getBusinessByIdForOwner).mockResolvedValue(null);
      await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow("not-found");
    });
    it("returns not found for malformed IDs without querying", async () => {
      await expect(Page({ params: Promise.resolve({ id: "invalid" }) })).rejects.toThrow("not-found");
      expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
    });
    it("does not turn database failures into 404s", async () => {
      vi.mocked(getBusinessByIdForOwner).mockRejectedValue(new Error("Unable to load business."));
      await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow("Unable to load business.");
    });
    it("requires authentication before loading a business", async () => {
      vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("redirect:/login"));
      await expect(Page({ params: Promise.resolve({ id }) })).rejects.toThrow("redirect:/login");
      expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
    });
  });
}
it("shows business details read-only with a link to edit and no delete", async () => {
  render(await BusinessDetailPage({ params: Promise.resolve({ id }) }));
  expect(screen.getByRole("heading", { level: 1, name: "Acme" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { level: 2, name: "Business details" })).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.getByText("Boise")).toBeInTheDocument();
  // Empty fields show a muted dash, announced as "Not provided".
  expect(screen.getAllByText("Not provided")).toHaveLength(3);
  expect(screen.getAllByText("—")).toHaveLength(3);
  expect(screen.getByRole("link", { name: "Edit details" })).toHaveAttribute("href", `/admin/businesses/${id}/edit`);
  expect(screen.queryByRole("button", { name: "Delete business" })).not.toBeInTheDocument();
});
it("deletes from the settings page after confirming in a modal dialog", async () => {
  render(await BusinessSettingsPage({ params: Promise.resolve({ id }) }));
  expect(screen.getByRole("heading", { level: 2, name: "Settings" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Delete business" }));
  const dialog = screen.getByRole("dialog", { name: "Delete Acme?" });
  expect(dialog).toHaveAccessibleDescription(/cannot be undone/i);
  expect(screen.getByRole("button", { name: "Permanently delete business" })).toHaveAttribute("value", "delete");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
