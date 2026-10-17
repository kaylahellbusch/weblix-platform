// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MAX_CSV_BYTES, parseBusinessCsv } from "./parser";
const parse = (text: string) => parseBusinessCsv(new TextEncoder().encode(text));
describe("business CSV boundary", () => {
  it("parses the documented synthetic fixture as shared business inputs", () => {
    const result = parseBusinessCsv(readFileSync(new URL("./fixtures/sample.csv", import.meta.url)));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.counts).toEqual({ valid: 2, invalid: 0, duplicate: 0 });
    expect(result.rows[0].data.phone).toBe("001-555-0100");
    expect(result.rows[1].data.name).toBe('Example "North"');
  });
  it("handles BOM, reordered columns, CRLF, quoted newlines, and blank records", () => {
    const result = parse('\uFEFFindustry,name\r\n\r\n Design ,"Example,\r\nStudio"\r\n,,\r\nRoofing,Other\r\n');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toEqual([
      { record: 2, data: { name: "Example,\r\nStudio", industry: "Design" } },
      { record: 4, data: { name: "Other", industry: "Roofing" } },
    ]);
  });
  it("returns field errors and only valid normalized rows, with deterministic duplicates", () => {
    const result = parse("name,industry,phone,email,website,city,state\n Example , Design ,001,,, Boise , ID \nExample,Design,001,,,Boise,ID\nExample,Design,002,,,Boise,ID\n,Design,,bad,nope,,\n,Design,,bad,nope,,");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.counts).toEqual({ valid: 2, invalid: 2, duplicate: 1 });
    expect(result.duplicates).toEqual([{ record: 2, firstRecord: 1 }]);
    expect(result.invalidRows.map((row) => row.record)).toEqual([4, 5]);
    expect(Object.keys(result.invalidRows[0].fields)).toEqual(["name", "email", "website"]);
    expect(result.rows[0].data).toMatchObject({ name: "Example", city: "Boise", phone: "001" });
  });
  it.each(["", "\uFEFF", "\n , \n", "name,industry", "name,industry\n,,\n"])("rejects empty files: %j", (text) => {
    expect(parse(text)).toEqual({ ok: false, error: "empty" });
  });
  it.each(["Name,industry", "name,Industry", "name,name,industry", "name", "name,industry,owner_id", "name,industry,unknown", " name,industry"])("rejects invalid headers: %s", (header) => {
    expect(parse(`${header}\nx,y`)).toEqual({ ok: false, error: "invalid_headers" });
  });
  it.each(['"unfinished', 'ab"cd', '"closed"tail', '"closed" ', "a\rb"])("rejects malformed CSV: %j", (value) => {
    expect(parse(`name,industry\n${value},Design`)).toEqual({ ok: false, error: "malformed_csv" });
  });
  it.each(["a", "a,b,c"])("rejects mismatched nonblank records", (value) => {
    expect(parse(`name,industry\nValid,Design\n${value}`)).toEqual({ ok: false, error: "field_count" });
  });
  it("rejects invalid UTF-8 without returning raw input", () => {
    expect(parseBusinessCsv(new Uint8Array([0xc3, 0x28]))).toEqual({ ok: false, error: "invalid_utf8" });
  });
  it("enforces bytes including BOM and multibyte characters at the exact boundary", () => {
    const prefix = "\uFEFFname,industry\n";
    const text = prefix + "é".repeat(100) + "x".repeat(MAX_CSV_BYTES - new TextEncoder().encode(prefix).length - 202) + ",a";
    expect(new TextEncoder().encode(text).length).toBe(MAX_CSV_BYTES);
    expect(parse(text).ok).toBe(true); // accepted file; oversized name is a row error
    expect(parse(text + "x")).toEqual({ ok: false, error: "too_large" });
  });
  it("allows 500 nonblank records including invalids/duplicates, rejects 501", () => {
    const text = "name,industry\n" + "Example,Design\n\n".repeat(500);
    const result = parse(text);
    expect(result.ok && result.counts).toEqual({ valid: 1, invalid: 0, duplicate: 499 });
    expect(parse(text + ",Design")).toEqual({ ok: false, error: "too_many_records" });
  });
  it("treats all seven normalized fields as the duplicate identity", () => {
    const result = parse("name,industry,phone,email,website,city,state\nA,B,,,,,\n A , B , , , , , \nA,C,,,,,\nA,B,1,,,,\nA,B,,a@example.com,,,\nA,B,,,https://example.com,,\nA,B,,,,C,\nA,B,,,,,D\na,B,,,,,");
    expect(result.ok && result.counts).toEqual({ valid: 8, invalid: 0, duplicate: 1 });
  });
});
