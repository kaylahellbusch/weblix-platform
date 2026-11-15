// @vitest-environment node
import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/supabase/proxy", () => ({ updateSession: vi.fn(async () => NextResponse.next()) }));
import { updateSession } from "@/lib/supabase/proxy";
import { proxy } from "./proxy";

const request = (host: string, path = "/") => new NextRequest(`http://${host}${path}`, { headers: { host } });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("host proxy", () => {
  it("leaves routing and auth behavior unchanged with no root domain", async () => {
    vi.stubEnv("ROOT_DOMAIN", "");
    for (const path of ["/", "/something", "/administrator"]) {
      expect((await proxy(request("roof.localhost", path))).headers.get("x-middleware-rewrite")).toBeNull();
    }
    expect(updateSession).not.toHaveBeenCalled();
    await proxy(request("localhost", "/admin"));
    await proxy(request("localhost", "/login"));
    expect(updateSession).toHaveBeenCalledTimes(2);
  });
  it("rewrites tenant hosts before auth and rejects app paths on tenant hosts", async () => {
    vi.stubEnv("ROOT_DOMAIN", "localhost");
    expect((await proxy(request("roof.localhost"))).headers.get("x-middleware-rewrite")).toBe("http://roof.localhost/public-site");
    expect((await proxy(request("roof.localhost", "/admin"))).headers.get("x-middleware-rewrite")).toBe("http://roof.localhost/public-site?missing=1");
    expect(updateSession).not.toHaveBeenCalled();
    for (const host of ["localhost", "www.localhost", "deployment.vercel.app"]) {
      expect((await proxy(request(host))).headers.get("x-middleware-rewrite")).toBeNull();
    }
  });
});
