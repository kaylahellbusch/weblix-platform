import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createBusinessForCurrentUser,
  getBusinessForCurrentUser,
  listBusinessesForCurrentUser,
} from "@/lib/businesses/service";
import {
  createBusinessForOwner,
  getBusinessByIdForOwner,
  listBusinessesByOwner,
} from "@/lib/businesses/repository";
import type { Database } from "@/lib/database.types";

vi.mock("@/lib/businesses/repository", () => ({
  createBusinessForOwner: vi.fn(),
  getBusinessByIdForOwner: vi.fn(),
  listBusinessesByOwner: vi.fn(),
}));

type AppSupabaseClient = SupabaseClient<Database>;

function createSupabaseClientWithUser(userId: string | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: userId ? { id: userId } : null,
        },
      }),
    },
  } as unknown as AppSupabaseClient;
}

describe("business service auth and errors", () => {
  it("returns unauthenticated when creating without a user", async () => {
    const supabase = createSupabaseClientWithUser(null);

    const result = await createBusinessForCurrentUser(supabase, {
      name: "Acme Roofing",
      industry: "roofing",
    });

    expect(result.status).toBe("unauthenticated");
    expect(createBusinessForOwner).not.toHaveBeenCalled();
  });

  it("creates a business for the authenticated user", async () => {
    const supabase = createSupabaseClientWithUser("user-1");
    vi.mocked(createBusinessForOwner).mockResolvedValueOnce({
      id: "business-1",
      owner_id: "user-1",
      name: "Acme Roofing",
      industry: "roofing",
      phone: null,
      email: null,
      website: null,
      city: null,
      state: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });

    const result = await createBusinessForCurrentUser(supabase, {
      name: "Acme Roofing",
      industry: "roofing",
    });

    expect(result.status).toBe("success");
    expect(createBusinessForOwner).toHaveBeenCalledWith(
      supabase,
      "user-1",
      expect.objectContaining({ name: "Acme Roofing" }),
    );
  });

  it("returns a safe error when persistence fails", async () => {
    const supabase = createSupabaseClientWithUser("user-1");
    vi.mocked(createBusinessForOwner).mockRejectedValueOnce(
      new Error("db unavailable"),
    );

    const result = await createBusinessForCurrentUser(supabase, {
      name: "Acme Roofing",
      industry: "roofing",
    });

    expect(result.status).toBe("error");
  });

  it("returns empty list for unauthenticated users", async () => {
    const supabase = createSupabaseClientWithUser(null);

    const result = await listBusinessesForCurrentUser(supabase);

    expect(result).toEqual([]);
    expect(listBusinessesByOwner).not.toHaveBeenCalled();
  });

  it("returns null business for unauthenticated users", async () => {
    const supabase = createSupabaseClientWithUser(null);

    const result = await getBusinessForCurrentUser(supabase, "business-1");

    expect(result).toBeNull();
    expect(getBusinessByIdForOwner).not.toHaveBeenCalled();
  });
});
