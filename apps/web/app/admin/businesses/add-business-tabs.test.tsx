import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePathname } from "next/navigation";
import { AddBusinessTabs } from "./add-business-tabs";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("add business tabs", () => {
  it("links both ways to add businesses and marks the current one", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/businesses/import");
    render(<AddBusinessTabs />);
    expect(screen.getByRole("navigation", { name: "Ways to add businesses" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enter details" })).toHaveAttribute("href", "/admin/businesses/new");
    expect(screen.getByRole("link", { name: "Enter details" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Import from CSV" })).toHaveAttribute("aria-current", "page");
  });

  it("blocks switching while locked", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/businesses/import");
    render(<AddBusinessTabs locked />);
    const other = screen.getByRole("link", { name: "Enter details" });
    expect(other).toHaveAttribute("aria-disabled", "true");
    // fireEvent returns false when the click's default navigation was prevented.
    expect(fireEvent.click(other)).toBe(false);
  });
});
