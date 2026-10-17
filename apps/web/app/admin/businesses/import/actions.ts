"use server";

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

export type UploadReview = { result?: Extract<BusinessCsvResult, { ok: true }>; error?: string };

export async function reviewBusinessCsvAction(formData: FormData): Promise<UploadReview> {
  await requireAuthenticatedUser();
  const file = formData.get("csv");
  if (!(file instanceof File)) return { error: "Choose a CSV file to review." };
  try {
    const result = await reviewCsvUpload(file);
    return result.ok ? { result } : { error: errors[result.error] };
  } catch {
    return { error: "We could not read this file. Choose it again and retry." };
  }
}
