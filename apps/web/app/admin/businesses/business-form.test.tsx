import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BusinessForm } from "./business-form";
import type { BusinessFormState } from "@/lib/businesses/form-state";

describe("shared create/edit business form", () => {
  it("prefills all editable fields and provides a cancel link without submitting", () => {
    const action = vi.fn();
    render(<BusinessForm action={action} submitLabel="Save changes" cancelHref="/admin/businesses/business-1" title="Acme" subtitle="Edit business details" initialValues={{ name: "Acme", industry: "roofing", phone: "555-0100", email: "owner@example.com", website: "https://example.com", city: "Boise", state: "ID" }} />);
    for (const [label, value] of [["Business name", "Acme"], ["Industry", "roofing"], ["Phone", "555-0100"], ["Email", "owner@example.com"], ["Website", "https://example.com"], ["City", "Boise"], ["State", "ID"]]) {
      expect(screen.getByLabelText(label)).toHaveValue(value);
    }
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute("href", "/admin/businesses/business-1");
    expect(screen.getByRole("heading", { level: 1, name: "Acme" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Edit business details" })).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("keeps the header's save button disabled until a field changes", () => {
    render(<BusinessForm action={vi.fn()} submitLabel="Save changes" cancelHref="/admin" title="Acme" initialValues={{ name: "Acme", industry: "roofing" }} />);
    const save = screen.getByRole("button", { name: "Save changes" });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute("form", "business-form");
    fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "555-0100" } });
    expect(save).toBeEnabled();
  });

  it("leaves Industry empty for a new business instead of assuming one", () => {
    render(<BusinessForm action={vi.fn()} submitLabel="Create business" cancelHref="/admin" title="Add business" />);
    expect(screen.getByLabelText("Industry")).toHaveValue("");
    expect(screen.getByLabelText("Industry")).toHaveAttribute("placeholder", expect.stringContaining("Roofing"));
  });

  it("preserves edits and associates errors after repeated validation failures", async () => {
    const action = vi.fn(async (_state: BusinessFormState, data: FormData): Promise<BusinessFormState> => ({
      values: { name: String(data.get("name")), industry: "roofing" },
      fieldErrors: { name: "Business name must be 120 characters or less." },
      formError: "Please fix the highlighted fields and try again.",
    }));
    render(<BusinessForm action={action} submitLabel="Save changes" cancelHref="/admin" title="Original" initialValues={{ name: "Original", industry: "roofing" }} />);
    for (const value of ["x".repeat(121), "y".repeat(122)]) {
      fireEvent.change(screen.getByLabelText("Business name"), { target: { value } });
      fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
      await waitFor(() => expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled());
      expect(screen.getByLabelText("Business name")).toHaveValue(value);
      expect(screen.getByLabelText("Business name")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByLabelText("Business name")).toHaveAttribute("aria-describedby", "name-error");
    }
    expect(action).toHaveBeenCalledTimes(2);
  });
});
