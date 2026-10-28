import { describe, expect, it, vi } from "vitest";
import { createBusinessAction } from "@/app/admin/businesses/new/actions";
import { createBusinessForCurrentUser } from "@/lib/businesses/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    redirectMock(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/businesses/service", () => ({
  createBusinessForCurrentUser: vi.fn(),
}));

function buildFormData(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.set(key, value);
  });
  return formData;
}

describe("createBusinessAction", () => {
  it("redirects to the persisted business after a successful save", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
    vi.mocked(createBusinessForCurrentUser).mockResolvedValueOnce({
      status: "success",
      business: { id: "saved-business-id" } as never,
    });

    await expect(
      createBusinessAction({}, buildFormData({ name: "Acme Roofing", industry: "roofing" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(revalidatePath).toHaveBeenCalledWith("/admin", "layout");
    expect(redirectMock).toHaveBeenLastCalledWith("/admin/businesses/saved-business-id");
  });

  it("redirects unauthenticated create attempts to login", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
    vi.mocked(createBusinessForCurrentUser).mockResolvedValueOnce({
      status: "unauthenticated",
    });

    await expect(
      createBusinessAction(
        {},
        buildFormData({
          name: "Acme Roofing",
          industry: "roofing",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("returns safe form error and preserves values on persistence failure", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
    vi.mocked(createBusinessForCurrentUser).mockResolvedValueOnce({
      status: "error",
    });

    const result = await createBusinessAction(
      {},
      buildFormData({
        name: "Acme Roofing",
        industry: "roofing",
        city: "Phoenix",
      }),
    );

    expect(result.formError).toMatch(/could not save/i);
    expect(result.values).toMatchObject({
      name: "Acme Roofing",
      industry: "roofing",
      city: "Phoenix",
    });
  });
});
