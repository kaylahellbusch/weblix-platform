import {
  CREATE_BUSINESS_FIELDS,
  createBusinessSchema,
  type CreateBusinessInput,
} from "../businesses/schema";

export const MAX_CSV_BYTES = 1024 * 1024;
export const MAX_CSV_RECORDS = 500;
type Field = (typeof CREATE_BUSINESS_FIELDS)[number];
export type CsvFileError = "too_large" | "invalid_utf8" | "empty" | "malformed_csv" | "invalid_headers" | "field_count" | "too_many_records";
export type BusinessCsvResult =
  | { ok: false; error: CsvFileError }
  | {
      ok: true;
      rows: { record: number; data: CreateBusinessInput }[];
      invalidRows: { record: number; fields: Partial<Record<Field, string[]>> }[];
      duplicates: { record: number; firstRecord: number }[];
      counts: { valid: number; invalid: number; duplicate: number };
    };

// A strict CSV scanner: quotes may only open a field and must be followed
// by a delimiter, line ending, escaped quote, or end of input.
function scan(text: string): string[][] | undefined {
  const records: string[][] = [];
  let fields: string[] = [];
  let value = "";
  let state: "start" | "text" | "quoted" | "closed" = "start";
  const field = () => { fields.push(value); value = ""; state = "start"; };
  const record = () => { field(); records.push(fields); fields = []; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (state === "quoted") {
      if (char === '"') {
        if (text[i + 1] === '"') { value += '"'; i++; }
        else state = "closed";
      } else value += char;
    } else if (char === ",") field();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] !== "\n") return undefined;
      if (char === "\r") i++;
      record();
    } else if (char === '"' && state === "start") state = "quoted";
    else if (char === '"' || state === "closed") return undefined;
    else { value += char; state = "text"; }
  }
  if (state === "quoted") return undefined;
  if (fields.length || value.length || state !== "start") record();
  return records;
}

/** Pure validation only: no persistence, network access, or logging. */
export function parseBusinessCsv(input: Uint8Array): BusinessCsvResult {
  const fail = (error: CsvFileError): BusinessCsvResult => ({ ok: false, error });
  if (input.byteLength > MAX_CSV_BYTES) return fail("too_large");
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(input); }
  catch { return fail("invalid_utf8"); }
  const records = scan(text);
  if (!records) return fail("malformed_csv");
  const blank = (record: string[]) => record.every((value) => value.trim() === "");
  const headerIndex = records.findIndex((record) => !blank(record));
  if (headerIndex === -1) return fail("empty");
  const headers = records[headerIndex];
  if (new Set(headers).size !== headers.length ||
      headers.some((header) => !CREATE_BUSINESS_FIELDS.includes(header as Field)) ||
      !headers.includes("name") || !headers.includes("industry")) return fail("invalid_headers");
  const dataRecords = records.slice(headerIndex + 1);
  const nonblank = dataRecords.filter((record) => !blank(record));
  if (!nonblank.length) return fail("empty");
  if (nonblank.length > MAX_CSV_RECORDS) return fail("too_many_records");
  if (nonblank.some((record) => record.length !== headers.length)) return fail("field_count");
  const rows: Extract<BusinessCsvResult, { ok: true }>["rows"] = [];
  const invalidRows: Extract<BusinessCsvResult, { ok: true }>["invalidRows"] = [];
  const duplicates: Extract<BusinessCsvResult, { ok: true }>["duplicates"] = [];
  const seen = new Map<string, number>();
  dataRecords.forEach((values, index) => {
    if (blank(values)) return;
    const record = index + 1;
    const parsed = createBusinessSchema.safeParse(Object.fromEntries(headers.map((header, i) => [header, values[i]])));
    if (!parsed.success) {
      const fields: Partial<Record<Field, string[]>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        (fields[key] ??= []).push(issue.message);
      }
      invalidRows.push({ record, fields });
      return;
    }
    const key = JSON.stringify(CREATE_BUSINESS_FIELDS.map((field) => parsed.data[field] ?? null));
    const firstRecord = seen.get(key);
    if (firstRecord !== undefined) duplicates.push({ record, firstRecord });
    else { seen.set(key, record); rows.push({ record, data: parsed.data }); }
  });
  return { ok: true, rows, invalidRows, duplicates,
    counts: { valid: rows.length, invalid: invalidRows.length, duplicate: duplicates.length } };
}
