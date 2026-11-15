import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";
import { loginAction } from "./actions";

vi.mock("./actions", () => ({ loginAction: vi.fn(async () => ({ error: "Test response" })) }));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("login password visibility", () => {
  it("toggles password visibility and keeps the value", () => {
    render(<LoginForm />);
    const input = screen.getByLabelText("Password");
    fireEvent.change(input, { target: { value: "Synthetic-password-70" } });
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("Synthetic-password-70");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("Synthetic-password-70");
  });

  it("button name and pressed state", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keyboard toggle does not submit", () => {
    render(<LoginForm />);
    const button = screen.getByRole("button", { name: "Show password" });
    expect(button).toHaveAttribute("type", "button");
    button.focus();
    expect(button).toHaveFocus();
    // Native keyboard activation is exercised in the browser acceptance spec.
    fireEvent.click(button);
    expect(loginAction).not.toHaveBeenCalled();
  });

  it.each([false, true])("submits the typed password with visibility %s", async (visible) => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "synthetic@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Synthetic-password-70" } });
    if (visible) fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(loginAction).toHaveBeenCalledTimes(1));
    const data = vi.mocked(loginAction).mock.calls[0][1];
    expect(data.get("password")).toBe("Synthetic-password-70");
    expect(data.get("email")).toBe("synthetic@example.com");
  });
});
