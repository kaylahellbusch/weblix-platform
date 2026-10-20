import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BusinessCsvResult } from "./parser";

export async function confirmBusinessImport(key: string, digest: string, review: Extract<BusinessCsvResult, { ok: true }>): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("confirm_business_import", {
    request_key: key, file_digest: digest,
    accepted_rows: review.rows.map(row => ({ ...row.data })),
    invalid_count: review.counts.invalid, duplicate_count: review.counts.duplicate,
  });
  if (error || data === null) throw new Error("Import result unavailable.");
  return data;
}
