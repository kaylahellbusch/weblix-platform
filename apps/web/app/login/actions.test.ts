import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction } from "./actions";

const { signIn, createClient, redirect } = vi.hoisted(() => ({
  signIn: vi.fn(),
  createClient: vi.fn(),
  redirect: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: createClient }));
vi.mock("next/navigation", () => ({ redirect }));

beforeEach(() => {
  vi.clearAllMocks();
  createClient.mockResolvedValue({ auth: { signInWithPassword: signIn } });
});

describe("login action", () => {
  it("requires email and password before attempting sign in", async () => {
    expect(await loginAction({}, new FormData())).toEqual({ error: "Email and password are required." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("reports a rejected sign in", async () => {
    signIn.mockResolvedValue({ error: new Error("Invalid credentials") });
    const data = new FormData();
    data.set("email", "synthetic@example.com");
    data.set("password", "Synthetic-password-70");
    expect(await loginAction({}, data)).toEqual({ error: "Sign in failed. Check your email and password and try again." });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("passes the password unchanged and redirects after successful sign in", async () => {
    signIn.mockResolvedValue({ error: null });
    const data = new FormData();
    data.set("email", " synthetic@example.com ");
    data.set("password", " Synthetic-password-70 ");
    await loginAction({}, data);
    expect(signIn).toHaveBeenCalledWith({ email: "synthetic@example.com", password: " Synthetic-password-70 " });
    expect(redirect).toHaveBeenCalledWith("/admin");
  });
});
