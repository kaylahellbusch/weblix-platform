// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = { getClaims: vi.fn(), getUser: vi.fn() };
let setAll: (cookies: { name: string; value: string; options?: object }[]) => void;

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url, _key, options) => {
    setAll = options.cookies.setAll;
    return { auth };
  }),
}));
vi.mock("@/lib/supabase/env", () => ({
  getSupabaseConfig: () => ({ url: "https://example.supabase.co", publishableKey: "test-key" }),
}));

import { updateSession } from "@/lib/supabase/proxy";

const request = (path: string) => new NextRequest(`http://localhost:3000${path}`);
const signedIn = { data: { claims: { sub: "user-1" } } };
const signedOut = { data: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth proxy", () => {
  it("lets a verified session through to /admin without a Supabase Auth round trip", async () => {
    auth.getClaims.mockResolvedValue(signedIn);
    const response = await updateSession(request("/admin/businesses/new"));
    expect(response.headers.get("location")).toBeNull();
    expect(auth.getUser).not.toHaveBeenCalled();
  });

  it("redirects /admin to /login without a valid session and keeps refreshed cookies", async () => {
    auth.getClaims.mockImplementation(async () => {
      setAll([{ name: "sb-auth", value: "", options: { maxAge: 0 } }]);
      return signedOut;
    });
    const response = await updateSession(request("/admin"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    expect(response.cookies.get("sb-auth")?.value).toBe("");
  });

  it("sends a signed-in user from /login to /admin", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await updateSession(request("/login"));
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin");
  });

  it("shows /login when the session was revoked, even if its JWT has not expired", async () => {
    auth.getClaims.mockResolvedValue(signedIn);
    auth.getUser.mockResolvedValue({ data: { user: null } });
    const response = await updateSession(request("/login"));
    expect(response.headers.get("location")).toBeNull();
    expect(auth.getClaims).not.toHaveBeenCalled();
  });
});
