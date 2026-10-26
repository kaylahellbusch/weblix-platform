import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessViews } from "./business-views";
import type { Business } from "@/lib/businesses/repository";
const businesses = [
  { id: "one", name: "Willow & Pine", industry: "Florist", city: "Boise", state: "ID", website: "https://willow.example.test" },
  { id: "two", name: "Summit Plumbing", industry: "Plumbing", city: "Meridian", state: "ID", website: null },
] as Business[];
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("business browsing", () => {
  it("filters displayed metadata without losing context or actions across layouts", () => {
    render(<BusinessViews businesses={businesses} />);
    fireEvent.change(screen.getByLabelText("Search businesses"), { target: { value: "  MERIDIAN " } });
    expect(screen.queryByText("Willow & Pine")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Compact" }));
    expect(screen.getByLabelText("Search businesses")).toHaveValue("  MERIDIAN ");
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Edit website for Summit Plumbing" })).toHaveAttribute("href", "/admin/businesses/two/content");
    expect(screen.getByRole("link", { name: "View details for Summit Plumbing" })).toHaveAttribute("href", "/admin/businesses/two");
    fireEvent.change(screen.getByLabelText("Search businesses"), { target: { value: "willow.example.test" } });
    expect(screen.getByText("Willow & Pine")).toBeInTheDocument();
    expect(screen.queryByText("Summit Plumbing")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search businesses"), { target: { value: "missing" } });
    expect(screen.getByText("No matching businesses")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByText("Summit Plumbing")).toBeInTheDocument();
  });
  it("restores the browser preference and tolerates invalid or unavailable storage", () => {
    localStorage.setItem("weblix-business-view", "compact");
    const { unmount } = render(<BusinessViews businesses={businesses} />);
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
    unmount();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<BusinessViews businesses={businesses} />);
    fireEvent.click(screen.getByRole("button", { name: "Compact" }));
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute("aria-pressed", "true");
  });
  it("provides an intentional empty state", () => {
    render(<BusinessViews businesses={[]} />);
    expect(screen.getByText("No businesses yet")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("0 businesses");
  });
});
