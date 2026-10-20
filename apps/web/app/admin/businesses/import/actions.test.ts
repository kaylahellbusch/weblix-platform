// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { confirmBusinessCsvAction, reviewBusinessCsvAction } from "./actions";
import { MAX_CSV_BYTES } from "@/lib/business-csv/parser";
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ rpc }) }));
const upload = (input: string | Uint8Array) => {
  const data = new FormData();
  data.set("csv", new File([typeof input === "string" ? input : Uint8Array.from(input).buffer], "synthetic.csv"));
  return data;
};
beforeEach(() => { process.env.CSV_REVIEW_SECRET = "synthetic-test-signing-secret-32-chars"; rpc.mockReset().mockResolvedValue({ data: 1, error: null }); vi.mocked(requireAuthenticatedUser).mockReset().mockResolvedValue({ id: "synthetic" } as never); });
describe("CSV review action", () => {
  it("authenticates before even inspecting the upload", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("NEXT_REDIRECT"));
    const data = upload("name,industry\nExample,roofing");
    const get = vi.spyOn(data, "get");
    await expect(reviewBusinessCsvAction(data)).rejects.toThrow("NEXT_REDIRECT");
    expect(get).not.toHaveBeenCalled();
  });
  it("returns normalized rows, field errors and duplicate references without persistence", async () => {
    const result = await reviewBusinessCsvAction(upload("name,industry,email\n Example ,roofing,\n,roofing,bad\nExample,roofing,"));
    expect(result.result?.counts).toEqual({ valid: 1, invalid: 1, duplicate: 1 });
    expect(result.result?.rows[0].data.name).toBe("Example");
    expect(result.result?.invalidRows[0].fields.email).toBeDefined();
    expect(result.result?.duplicates).toEqual([{ record: 3, firstRecord: 1 }]);
  });
  it.each([
    ["", /empty/], ['name,industry\n"unfinished', /malformed/],
    [new Uint8Array([255]), /UTF-8/], ["x".repeat(MAX_CSV_BYTES + 1), /1 MiB/],
    ["name,industry\n" + "Example,roofing\n".repeat(501), /500/],
    ["name,other\nExample,x", /headers/], ["name,industry\nExample,roofing,extra", /same number/],
  ])("returns only safe error state for invalid input", async (input, message) => {
    const result = await reviewBusinessCsvAction(upload(input));
    expect(result.error).toMatch(message);
    expect(result.result).toBeUndefined();
  });
  it("handles missing files and read failures safely", async () => {
    expect((await reviewBusinessCsvAction(new FormData())).error).toMatch(/Choose/);
    const file = new File(["data"], "synthetic.csv");
    vi.spyOn(file, "arrayBuffer").mockRejectedValue(new Error("private content"));
    const data = { get: () => file } as unknown as FormData;
    expect(await reviewBusinessCsvAction(data)).toEqual({ error: "We could not read this file. Choose it again and retry." });
  });
});

describe("CSV confirmation", () => {
  it("revalidates bytes, ignores client counts and keeps the request key on retry", async () => {
    const data = upload("name,industry\nExample,roofing\n,roofing\nExample,roofing");
    const review = await reviewBusinessCsvAction(data);
    data.set("reviewToken", review.token!);
    data.set("owner_id", "someone-else");
    data.set("valid", "500");
    expect(await confirmBusinessCsvAction(data)).toEqual({ inserted: 1, invalid: 1, duplicate: 1 });
    await confirmBusinessCsvAction(data);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
    expect(rpc.mock.calls[0][1]).toMatchObject({ accepted_rows: [{ name: "Example", industry: "roofing" }], invalid_count: 1, duplicate_count: 1 });
  });
  it("rejects changed bytes, tampered tokens, other owners and zero valid rows before persistence", async () => {
    const data = upload("name,industry\nExample,roofing");
    const review = await reviewBusinessCsvAction(data);
    data.set("reviewToken", review.token!);
    data.set("csv", new File(["name,industry\nChanged,roofing"], "changed.csv"));
    expect((await confirmBusinessCsvAction(data)).error).toMatch(/changed/);
    data.set("reviewToken", "tampered");
    expect((await confirmBusinessCsvAction(data)).error).toMatch(/changed/);
    const zero = upload("name,industry\n,roofing");
    zero.set("reviewToken", (await reviewBusinessCsvAction(zero)).token!);
    expect((await confirmBusinessCsvAction(zero)).error).toMatch(/no valid/);
    const original = upload("name,industry\nExample,roofing");
    original.set("reviewToken", review.token!);
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({ id: "other-owner" } as never);
    expect((await confirmBusinessCsvAction(original)).error).toMatch(/changed/);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("keeps transport and database failures uncertain and retries the same key", async () => {
    const data = upload("name,industry\nExample,roofing");
    data.set("reviewToken", (await reviewBusinessCsvAction(data)).token!);
    rpc.mockRejectedValueOnce(new Error("timeout"));
    expect((await confirmBusinessCsvAction(data)).uncertain).toBe(true);
    expect((await confirmBusinessCsvAction(data)).inserted).toBe(1);
    expect(rpc.mock.calls[0]).toEqual(rpc.mock.calls[1]);
  });
  it("authenticates before confirmation reads the upload", async () => {
    vi.mocked(requireAuthenticatedUser).mockRejectedValue(new Error("expired"));
    const data = upload("name,industry\nExample,roofing");
    const get = vi.spyOn(data, "get");
    expect((await confirmBusinessCsvAction(data)).error).toMatch(/session/);
    expect(get).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });
});
