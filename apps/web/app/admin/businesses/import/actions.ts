"use server";

import { revalidatePath } from "next/cache";
import { confirmBusinessImport } from "@/lib/business-csv/repository";
import { createReviewToken, verifyReviewToken, csvDigest } from "@/lib/business-csv/review-token";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { reviewCsvUpload } from "@/lib/business-csv/upload";
import type { BusinessCsvResult, CsvFileError } from "@/lib/business-csv/parser";

const errors: Record<CsvFileError, string> = {
  too_large: "Choose a CSV file no larger than 1 MiB (1,048,576 bytes).",
  too_many_records: "Use at most 500 nonblank data records, including invalid and duplicate records.",
  invalid_utf8: "Save the CSV as UTF-8 and try again.",
  empty: "The CSV is empty or contains no data records.",
  malformed_csv: "The CSV has malformed quotes or line endings. Use the sample format.",
  invalid_headers: "Use exact headers: name and industry are required; phone, email, website, city and state are optional. Do not repeat headers.",
  field_count: "Each data record must have the same number of fields as the header. Quote values containing commas.",
};

export type UploadReview = { result?: Extract<BusinessCsvResult, { ok: true }>; error?: string; token?: string };

export async function reviewBusinessCsvAction(formData: FormData): Promise<UploadReview> {
  const user = await requireAuthenticatedUser();
  const file = formData.get("csv");
  if (!(file instanceof File)) return { error: "Choose a CSV file to review." };
  try {
    const result = await reviewCsvUpload(file);
    return result.ok ? { result, token: createReviewToken(user.id, csvDigest(new Uint8Array(await file.arrayBuffer()))) } : { error: errors[result.error] };
  } catch {
    return { error: "We could not read this file. Choose it again and retry." };
  }
}

export type ImportOutcome = { inserted?: number; invalid?: number; duplicate?: number; error?: string; uncertain?: boolean };
export async function confirmBusinessCsvAction(formData: FormData): Promise<ImportOutcome> {
  let user;
  try { user = await requireAuthenticatedUser(); }
  catch { return { uncertain: true, error: "Your session could not be verified. Sign in in another tab, then retry this same request." }; }
  const file = formData.get("csv");
  const token = formData.get("reviewToken");
  if (!(file instanceof File) || typeof token !== "string") return { error: "Review this file before confirming." };
  let key: string;
  let result: Awaited<ReturnType<typeof reviewCsvUpload>>;
  let digest: string;
  try {
    result = await reviewCsvUpload(file);
    if (!result.ok) return { error: errors[result.error] };
    digest = csvDigest(new Uint8Array(await file.arrayBuffer()));
    key = verifyReviewToken(token, user.id, digest);
  } catch {
    return { error: "The file or review changed. Review the file again before importing." };
  }
  if (!result.rows.length) return { error: "There are no valid records to import." };
  try {
    const data = await confirmBusinessImport(key, digest, result);
    revalidatePath("/admin", "layout");
    return { inserted: data, invalid: result.counts.invalid, duplicate: result.counts.duplicate };
  } catch {
    return { uncertain: true, error: "The import outcome is unknown. Retry this same request to safely retrieve its result." };
  }
}
