// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { reviewBusinessCsvAction } from "./actions";
import { MAX_CSV_BYTES } from "@/lib/business-csv/parser";
vi.mock("@/lib/auth/user", () => ({ requireAuthenticatedUser: vi.fn() }));
const upload = (input: string | Uint8Array) => {
  const data = new FormData();
  data.set("csv", new File([typeof input === "string" ? input : Uint8Array.from(input).buffer], "synthetic.csv"));
  return data;
};
beforeEach(() => { vi.mocked(requireAuthenticatedUser).mockReset().mockResolvedValue({ id: "synthetic" } as never); });
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
