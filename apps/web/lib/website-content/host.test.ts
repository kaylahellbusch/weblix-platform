import { describe, expect, it } from "vitest";
import { publicSubdomain } from "./host";

describe("public host routing", () => {
  it("is opt-in, preserves app hosts, and identifies tenant candidates", () => {
    expect(publicSubdomain("roof.localhost:3000", "localhost")).toBe("roof");
    expect(publicSubdomain("ROOF.EXAMPLE.COM", "example.com")).toBe("roof");
    for (const host of ["localhost", "www.localhost", "roof.localhost.evil.test", "test.vercel.app"]) {
      expect(publicSubdomain(host, "localhost")).toBeNull();
    }
    expect(publicSubdomain("admin.localhost", "localhost")).toBe("admin");
    expect(publicSubdomain("foo.bar.localhost", "localhost")).toBe("foo.bar");
    expect(publicSubdomain("roof.localhost", undefined)).toBeNull();
    expect(publicSubdomain("roof.vercel.app", "vercel.app")).toBeNull();
  });
});
