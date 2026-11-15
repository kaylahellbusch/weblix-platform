import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GranitePreview } from "./preview";

vi.mock("next/font/google", () => ({ Inter: () => ({ className: "inter" }) }));

const preview = {
  business: { name: "Example Roofing", industry: "Roofing", phone: null, email: null, website: null, city: null, state: null },
  headline: "Example Roofing",
  actions: {},
};

describe("Granite contact wording", () => {
  it.each([false, true])("does not invent offers when publicSite=%s", (publicSite) => {
    const { container } = render(<GranitePreview preview={preview} publicSite={publicSite} />);
    expect(container).not.toHaveTextContent(/free|estimate|guarantee|warranty|insured|licensed/i);
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("button", { name: "Contact us" })).toBeDisabled();
  });
});
