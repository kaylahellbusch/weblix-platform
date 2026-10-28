import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
const id = "29d25f3f-2a5c-4c43-bdd5-6b84b8687d21";
const businesses = [{ id, name: "Acme" }];
const at = (path: string) => { vi.mocked(usePathname).mockReturnValue(path); return render(<SidebarNav businesses={businesses} />); };

describe("sidebar nav", () => {
  it("shows the workspace nav outside a business, with no one-item phone menu", () => {
    at("/admin");
    expect(screen.getAllByRole("link", { name: "Businesses" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Businesses" })[0]).toHaveAttribute("href", "/admin");
    expect(screen.queryByRole("link", { name: "Back to Businesses" })).not.toBeInTheDocument();
  });
  it("shows the business, the back link and Details current on a business page", () => {
    at(`/admin/businesses/${id}`);
    expect(screen.getByText("Acme", { selector: ".business-context-name" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Businesses" })).toHaveAttribute("href", "/admin");
    for (const link of screen.getAllByRole("link", { name: "Details" })) expect(link).toHaveAttribute("aria-current", "page");
    for (const link of screen.getAllByRole("link", { name: "Content" })) expect(link).toHaveAttribute("href", `/admin/businesses/${id}/content`);
    expect(screen.queryByRole("link", { name: "Businesses" })).not.toBeInTheDocument();
  });
  it("treats the edit page as Details", () => {
    at(`/admin/businesses/${id}/edit`);
    for (const link of screen.getAllByRole("link", { name: "Details" })) expect(link).toHaveAttribute("aria-current", "page");
  });
  it("labels the phone business menu with the name and page, and closes it on a tap elsewhere or Escape", () => {
    at(`/admin/businesses/${id}/content`);
    const summary = screen.getByText("Business menu:", { exact: false }).closest("summary")!;
    expect(summary).toHaveTextContent("Business menu: Acme, Content");
    const menu = summary.closest("details")!;
    fireEvent.click(summary);
    expect(menu).toHaveAttribute("open");
    fireEvent.pointerDown(document.body);
    expect(menu).not.toHaveAttribute("open");
    fireEvent.click(summary);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(menu).not.toHaveAttribute("open");
    expect(summary).toHaveFocus();
  });
  it("marks Settings current on the settings page", () => {
    at(`/admin/businesses/${id}/settings`);
    for (const link of screen.getAllByRole("link", { name: "Settings" })) expect(link).toHaveAttribute("aria-current", "page");
    for (const link of screen.getAllByRole("link", { name: "Details" })) expect(link).not.toHaveAttribute("aria-current");
  });
  it("marks Content current on the content page", () => {
    at(`/admin/businesses/${id}/content`);
    for (const link of screen.getAllByRole("link", { name: "Content" })) expect(link).toHaveAttribute("aria-current", "page");
  });
  it("keeps the business nav usable when the name is unknown", () => {
    at("/admin/businesses/00000000-0000-4000-8000-000000000000");
    expect(screen.getAllByRole("link", { name: "Details" })[0]).toHaveAttribute("href", "/admin/businesses/00000000-0000-4000-8000-000000000000");
  });
  it("keeps Businesses current on add and import pages, with no separate CSV link", () => {
    for (const path of ["/admin/businesses/new", "/admin/businesses/import"]) {
      const { unmount } = at(path);
      for (const link of screen.getAllByRole("link", { name: "Businesses" })) expect(link).toHaveAttribute("aria-current", "true");
      expect(screen.queryByRole("link", { name: /CSV/ })).not.toBeInTheDocument();
      unmount();
    }
  });
});
