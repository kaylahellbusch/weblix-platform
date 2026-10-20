// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { reviewCsvUpload } from "./upload";
import { MAX_CSV_BYTES, parseBusinessCsv } from "./parser";
vi.mock("./parser", async original => ({ ...await original<typeof import("./parser")>(), parseBusinessCsv: vi.fn() }));
describe("upload preflight", () => {
  it("rejects size before reading bytes", async () => {
    const file = new File(["x".repeat(MAX_CSV_BYTES + 1)], "large.csv");
    const read = vi.spyOn(file, "arrayBuffer");
    expect(await reviewCsvUpload(file)).toEqual({ ok: false, error: "too_large" });
    expect(read).not.toHaveBeenCalled();
  });
  it("rejects 501 logical data records before the full parser", async () => {
    vi.mocked(parseBusinessCsv).mockClear();
    expect(await reviewCsvUpload(new File(['name,industry\n' + '"One\ntwo",roofing\n'.repeat(501)], "many.csv"))).toEqual({ ok: false, error: "too_many_records" });
    expect(parseBusinessCsv).not.toHaveBeenCalled();
  });
  it("allows 500 records and ignores blank records without counting quoted newlines", async () => {
    vi.mocked(parseBusinessCsv).mockClear();
    await reviewCsvUpload(new File(['\nname,industry\n' + '\n"One\ntwo",roofing\n"  ",\n'.repeat(500)], "limit.csv"));
    expect(parseBusinessCsv).toHaveBeenCalledOnce();
  });
});
