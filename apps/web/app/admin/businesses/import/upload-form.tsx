"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CREATE_BUSINESS_FIELDS } from "@/lib/businesses/schema";
import { reviewBusinessCsvAction, type UploadReview } from "./actions";

export function CsvImportForm() {
  const [review, setReview] = useState<UploadReview>({});
  const [pending, setPending] = useState(false);
  const generation = useRef(0);
  const form = useRef<HTMLFormElement>(null);
  function clear() { generation.current++; setReview({}); setPending(false); }
  async function submit(data: FormData) {
    const request = ++generation.current;
    setReview({});
    setPending(true);
    try {
      const result = await reviewBusinessCsvAction(data);
      if (request === generation.current) setReview(result);
    } catch {
      if (request === generation.current) setReview({ error: "Review failed. Your session may have expired. Sign in again or retry with a CSV up to 1 MiB." });
    } finally {
      if (request === generation.current) setPending(false);
    }
  }
  const result = review.result;
  return <div className="space-y-4">
    <form ref={form} onSubmit={event => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <label className="block font-medium" htmlFor="csv">Business CSV file</label>
      <input id="csv" name="csv" type="file" accept=".csv,text/csv" required onChange={clear} aria-describedby="csv-help" className="block max-w-full" />
      <p id="csv-help" className="text-sm text-slate-600">Uploads are reviewed in memory only. Replacing the file clears the previous review.</p>
      <div className="flex flex-wrap gap-4">
        <button disabled={pending} className="rounded-lg bg-slate-900 px-3 py-2 text-white disabled:opacity-50" type="submit">{pending ? "Reviewing…" : "Review CSV"}</button>
        <button type="button" onClick={() => { clear(); form.current?.reset(); }} className="underline">Cancel review</button>
        <Link href="/admin" onClick={clear} className="underline">Back to businesses</Link>
      </div>
    </form>
    <div role="status" aria-live="polite">{pending ? "Reading and validating CSV…" : result ? `${result.counts.valid} valid, ${result.counts.invalid} invalid, ${result.counts.duplicate} duplicate records. Nothing has been imported.` : null}</div>
    {review.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{review.error}</p>}
    {result && <section aria-label="CSV review" className="space-y-4">
      <h3 className="text-lg font-semibold">Normalized valid records</h3>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Valid unique business records</caption>
        <thead><tr>{["Record", ...CREATE_BUSINESS_FIELDS].map(field => <th className="border p-2" scope="col" key={field}>{field}</th>)}</tr></thead>
        <tbody>{result.rows.map(row => <tr key={row.record}><th scope="row" className="border p-2">{row.record}</th>{CREATE_BUSINESS_FIELDS.map(field => <td className="max-w-xs break-words border p-2" key={field}>{row.data[field] ?? "—"}</td>)}</tr>)}</tbody>
      </table></div>
      <h3 className="text-lg font-semibold">Invalid records</h3>
      {result.invalidRows.length ? <ul>{result.invalidRows.map(row => <li key={row.record}>Record {row.record}<ul>{Object.entries(row.fields).map(([field, messages]) => <li key={field}>{field}: {messages.join(" ")}</li>)}</ul></li>)}</ul> : <p>No invalid records.</p>}
      <h3 className="text-lg font-semibold">Duplicate records</h3>
      {result.duplicates.length ? <ul>{result.duplicates.map(row => <li key={row.record}>Record {row.record} duplicates record {row.firstRecord}.</li>)}</ul> : <p>No duplicates.</p>}
      <p className="text-sm text-slate-600">Record 1 is the first record after the header. Blank records still occupy record numbers. Duplicates compare all normalized fields within this file only.</p>
    </section>}
  </div>;
}
