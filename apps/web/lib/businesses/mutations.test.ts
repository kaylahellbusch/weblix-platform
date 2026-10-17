import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateBusinessForOwner, deleteBusinessForOwner } from "./repository";
import { updateBusinessForCurrentUser, deleteBusinessForCurrentUser } from "./service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const input = { name: "Updated Roofing", industry: "roofing" };

function mockClient(userId: string | null, response = { data: { id: "business-1" } as { id: string } | null, error: null as { message: string } | null }) {
  const query = {
    update: vi.fn(), delete: vi.fn(), eq: vi.fn(), select: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(response),
  };
  query.update.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.select.mockReturnValue(query);
  const from = vi.fn().mockReturnValue(query);
  const getUser = vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null }, error: null });
  const client = { from, auth: { getUser } } as unknown as SupabaseClient<Database>;
  return { client, from, getUser, ...query };
}

beforeEach(() => vi.clearAllMocks());

describe("owner-scoped business mutations", () => {
  it("updates only editable fields, scopes by owner and ID, and clears blank optional fields", async () => {
    const mock = mockClient("owner-1");
    const tampered = { ...input, owner_id: "attacker", id: "other", created_at: "tampered" };
    await updateBusinessForOwner(mock.client, "business-1", "owner-1", tampered);
    expect(mock.update).toHaveBeenCalledWith({ ...input, phone: null, email: null, website: null, city: null, state: null });
    expect(mock.eq.mock.calls).toEqual([["owner_id", "owner-1"], ["id", "business-1"]]);
  });

  it("deletes by both owner and ID and returns only the deleted ID", async () => {
    const mock = mockClient("owner-1");
    expect(await deleteBusinessForOwner(mock.client, "business-1", "owner-1")).toEqual({ id: "business-1" });
    expect(mock.eq.mock.calls).toEqual([["owner_id", "owner-1"], ["id", "business-1"]]);
    expect(mock.select).toHaveBeenCalledWith("id");
  });

  for (const operation of ["update", "delete"] as const) {
    const run = (client: SupabaseClient<Database>) => operation === "update"
      ? updateBusinessForCurrentUser(client, "business-1", input)
      : deleteBusinessForCurrentUser(client, "business-1");

    it(`${operation}: does not query the database without a verified user`, async () => {
      const mock = mockClient(null);
      expect(await run(mock.client)).toEqual({ status: "unauthenticated" });
      expect(mock.from).not.toHaveBeenCalled();
    });

    it(`${operation}: rejects auth errors even if a user is returned`, async () => {
      const mock = mockClient("owner-1");
      mock.getUser.mockResolvedValue({ data: { user: { id: "owner-1" } }, error: { message: "invalid token" } });
      expect(await run(mock.client)).toEqual({ status: "unauthenticated" });
      expect(mock.from).not.toHaveBeenCalled();
    });

    it(`${operation}: derives ownership from the authenticated user`, async () => {
      const mock = mockClient("session-owner");
      expect(await run(mock.client)).toEqual({ status: "success" });
      expect(mock.eq).toHaveBeenCalledWith("owner_id", "session-owner");
    });

    it(`${operation}: treats zero affected rows as missing or inaccessible`, async () => {
      const mock = mockClient("other-owner", { data: null, error: null });
      expect(await run(mock.client)).toEqual({ status: "not-found" });
      expect(mock.eq).toHaveBeenCalledWith("owner_id", "other-owner");
    });

    it(`${operation}: returns a safe failure on database errors`, async () => {
      const mock = mockClient("owner-1", { data: null, error: { message: "private database detail" } });
      expect(await run(mock.client)).toEqual({ status: "error" });
    });

    it(`${operation}: handles network failures safely`, async () => {
      const mock = mockClient("owner-1");
      mock.maybeSingle.mockRejectedValue(new Error("network unavailable"));
      expect(await run(mock.client)).toEqual({ status: "error" });
    });
  }
});
