import { describe, expect, it, vi } from "vitest";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";

function createMockSupabaseForBusinessLookup() {
  const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const eqById = vi.fn().mockReturnValue({ maybeSingle });
  const eqByOwner = vi.fn().mockReturnValue({ eq: eqById });
  const select = vi.fn().mockReturnValue({ eq: eqByOwner });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as Parameters<typeof getBusinessByIdForOwner>[0],
    from,
    select,
    eqByOwner,
    eqById,
  };
}

describe("getBusinessByIdForOwner", () => {
  it("filters by owner id to prevent cross-user access", async () => {
    const { client, from, select, eqByOwner, eqById } =
      createMockSupabaseForBusinessLookup();

    await getBusinessByIdForOwner(client, "business-1", "owner-1");

    expect(from).toHaveBeenCalledWith("businesses");
    expect(select).toHaveBeenCalledWith("*");
    expect(eqByOwner).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(eqById).toHaveBeenCalledWith("id", "business-1");
  });
});
