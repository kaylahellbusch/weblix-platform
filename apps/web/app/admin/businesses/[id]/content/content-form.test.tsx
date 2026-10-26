import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContentForm } from "./content-form";
import type { ContentFormState } from "@/lib/website-content/form-state";
const initialContent = { headline: "Original", services: [{ title: "First", description: "Repair" }, { title: "Second", description: "Replace" }], serviceAreas: ["A", "B"] };
describe("website content editor", () => {
  it("shows confirmation only for the latest successful save and dismisses it on edits or errors", async () => {
    const action = vi.fn<(_: ContentFormState, data: FormData) => Promise<ContentFormState>>()
      .mockResolvedValueOnce({ saved: true })
      .mockResolvedValueOnce({ formError: "Invalid headline.", errors: [{ path: "headline", message: "Too long." }] })
      .mockResolvedValue({ saved: true });
    render(<ContentForm initialContent={initialContent} action={action} cancelHref="/admin" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save website content" }));
    await screen.findByRole("status");
    fireEvent.change(screen.getByLabelText(/Headline/), { target: { value: "x".repeat(161) } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save website content" }));
    await screen.findByRole("alert");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    // Correcting back to the stored value still confirms the next successful save.
    fireEvent.change(screen.getByLabelText(/Headline/), { target: { value: "Original" } });
    fireEvent.click(screen.getByRole("button", { name: "Save website content" }));
    await screen.findByRole("status");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move service 2 up" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("adds, removes and reorders without writing; cancel is a navigation link", () => {
    const action = vi.fn();
    const { container } = render(<ContentForm initialContent={initialContent} action={action} cancelHref="/admin/businesses/example" />);
    fireEvent.click(screen.getByRole("button", { name: "Move service 2 up" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move service area 1 down" }));
    fireEvent.click(screen.getByRole("button", { name: "Add service" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove service 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Add service area" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove service area 3" }));
    const content = JSON.parse((container.querySelector('[name="content"]') as HTMLInputElement).value);
    expect(content.services.map((item: { title: string }) => item.title)).toEqual(["Second", "First"]);
    expect(content.serviceAreas).toEqual(["B", "A"]);
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/admin/businesses/example");
    expect(action).not.toHaveBeenCalled();
  });
  it("retains exact values and order after repeated server validation failures", async () => {
    const action = vi.fn(async (): Promise<ContentFormState> => ({ formError: "Please fix fields.", errors: [{ path: "services.0.title", message: "Title is required." }] }));
    render(<ContentForm initialContent={initialContent} action={action} cancelHref="/admin" />);
    fireEvent.change(screen.getByLabelText(/Service 1 title/), { target: { value: "  " } });
    fireEvent.change(screen.getByLabelText(/Headline/), { target: { value: " My edits " } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    for (let i = 0; i < 2; i++) {
      fireEvent.click(screen.getByRole("button", { name: "Save website content" }));
      await waitFor(() => expect(action).toHaveBeenCalledTimes(i + 1));
      await waitFor(() => expect(screen.getByRole("button", { name: "Save website content" })).toBeEnabled());
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Headline/)).toHaveValue(" My edits ");
      expect(screen.getByLabelText(/Service 1 title/)).toHaveValue("  ");
      expect(screen.getByLabelText(/Service 1 title/)).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Title is required.")).toHaveAttribute("id", "services.0.title-error");
    }
  });
});
it("opens the collapsed Introduction panel when a server validation error targets it", async () => {
  const action = vi.fn(async (): Promise<ContentFormState> => ({ formError: "Please fix Introduction.", errors: [{ path: "introduction", message: "Introduction is too long." }] }));
  render(<ContentForm initialContent={initialContent} action={action} cancelHref="/admin" />);
  const introduction = screen.getByLabelText(/Introduction \(up to/);
  expect(introduction.closest("details")).not.toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Save website content" }));
  await screen.findByRole("alert");
  expect(introduction.closest("details")).toHaveAttribute("open");
  expect(introduction).toHaveAttribute("aria-describedby", "introduction-error");
});
