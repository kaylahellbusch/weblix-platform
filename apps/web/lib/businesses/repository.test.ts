import { describe, expect, it, vi } from "vitest";
import {
  getBusinessByIdForOwner,
  listBusinessesByOwner,
} from "@/lib/businesses/repository";

function createMockSupabaseForBusinessLookup(response: {
  data: unknown;
  error: unknown;
}) {
  const maybeSingle = vi.fn().mockResolvedValue(response);
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

function createMockSupabaseForBusinessList(response: {
  data: unknown;
  error: unknown;
}) {
  const order = vi.fn().mockResolvedValue(response);
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });

  return {
    client: { from } as unknown as Parameters<typeof listBusinessesByOwner>[0],
    from,
    select,
    eq,
    order,
  };
}

describe("getBusinessByIdForOwner", () => {
  it("filters by owner id to prevent cross-user access", async () => {
    const { client, from, select, eqByOwner, eqById } =
      createMockSupabaseForBusinessLookup({ data: null, error: null });

    await getBusinessByIdForOwner(client, "business-1", "owner-1");

    expect(from).toHaveBeenCalledWith("businesses");
    expect(select).toHaveBeenCalledWith("*");
    expect(eqByOwner).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(eqById).toHaveBeenCalledWith("id", "business-1");
  });

  it("throws generic error on database failures", async () => {
    const { client } = createMockSupabaseForBusinessLookup({
      data: null,
      error: { message: "db broken" },
    });

    await expect(
      getBusinessByIdForOwner(client, "business-1", "owner-1"),
    ).rejects.toThrow("Unable to load business.");
  });
});

describe("listBusinessesByOwner", () => {
  it("filters by owner id and newest-first ordering", async () => {
    const { client, from, select, eq, order } = createMockSupabaseForBusinessList({
      data: [],
      error: null,
    });

    await listBusinessesByOwner(client, "owner-1");

    expect(from).toHaveBeenCalledWith("businesses");
    expect(select).toHaveBeenCalledWith("*");
    expect(eq).toHaveBeenCalledWith("owner_id", "owner-1");
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws generic error on list failures", async () => {
    const { client } = createMockSupabaseForBusinessList({
      data: null,
      error: { message: "db broken" },
    });

    await expect(listBusinessesByOwner(client, "owner-1")).rejects.toThrow(
      "Unable to load businesses.",
    );
  });
});
