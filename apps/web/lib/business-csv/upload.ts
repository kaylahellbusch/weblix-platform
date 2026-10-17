import { MAX_CSV_BYTES, MAX_CSV_RECORDS, parseBusinessCsv, type BusinessCsvResult } from "./parser";

// Count nonblank logical records without allocating fields or parsed rows.
// The shared parser remains responsible for CSV syntax and row validation.
function exceedsRecordLimit(text: string): boolean {
  let quoted = false;
  let nonblank = false;
  let records = 0;
  const finish = () => {
    if (nonblank) records++;
    nonblank = false;
    return records > MAX_CSV_RECORDS + 1; // one header
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { nonblank = true; i++; }
      else quoted = !quoted;
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      if (finish()) return true;
    } else if (char !== "," && char.trim() !== "") nonblank = true;
    else if (quoted && char === ",") nonblank = true;
  }
  return finish();
}

export async function reviewCsvUpload(file: File): Promise<BusinessCsvResult> {
  if (file.size > MAX_CSV_BYTES) return { ok: false, error: "too_large" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_CSV_BYTES) return { ok: false, error: "too_large" };
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { return { ok: false, error: "invalid_utf8" }; }
  if (exceedsRecordLimit(text)) return { ok: false, error: "too_many_records" };
  return parseBusinessCsv(bytes);
}
