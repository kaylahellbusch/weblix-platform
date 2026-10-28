"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { CREATE_BUSINESS_FIELDS } from "@/lib/businesses/schema";
import { AddBusinessTabs } from "../add-business-tabs";
import { confirmBusinessCsvAction, reviewBusinessCsvAction, type ImportOutcome, type UploadReview } from "./actions";

export function CsvImportForm({ children }: { children?: ReactNode }) {
  const [review, setReview] = useState<UploadReview>({});
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcome>({});
  const [confirming, setConfirming] = useState(false);
  const reviewedData = useRef<FormData | null>(null);
  const confirmingRef = useRef(false);
  const generation = useRef(0);
  const form = useRef<HTMLFormElement>(null);
  function clear() { if (confirmingRef.current || outcome.uncertain) return; generation.current++; reviewedData.current = null; setReview({}); setOutcome({}); setPending(false); }
  async function submit(data: FormData) {
    if (locked || confirmingRef.current) return;
    reviewedData.current = data;
    const request = ++generation.current;
    setReview({});
    setOutcome({});
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
  async function confirm() {
    if (confirmingRef.current || !review.token || outcome.inserted !== undefined || !form.current) return;
    confirmingRef.current = true;
    setConfirming(true);
    const data = reviewedData.current;
    if (!data) { confirmingRef.current = false; setConfirming(false); return; }
    data.set("reviewToken", review.token);
    try { setOutcome(await confirmBusinessCsvAction(data)); }
    catch { setOutcome({ uncertain: true, error: "The import outcome is unknown. Sign in again if needed, then retry this same request." }); }
    finally { confirmingRef.current = false; setConfirming(false); }
  }
  const locked = confirming || Boolean(outcome.uncertain);
  const result = review.result;
  return <>
    <header className="editor-header">
      <h1>Add business</h1>
      <div className="editor-actions">
        <Link href="/admin" onClick={event => { if (locked) event.preventDefault(); else clear(); }} aria-disabled={locked || undefined} className="secondary">Cancel</Link>
      </div>
    </header>
    {/* Locked like Cancel while an import is saving or its outcome is unknown. */}
    <AddBusinessTabs locked={locked} />
    <div className="space-y-4">
    {children}
    <form ref={form} onSubmit={event => { event.preventDefault(); void submit(new FormData(event.currentTarget)); }} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <label className="block font-medium" htmlFor="csv">Business CSV file</label>
      <input id="csv" name="csv" type="file" disabled={locked} accept=".csv,text/csv" required onChange={clear} aria-describedby="csv-help" className="block max-w-full" />
      <p id="csv-help" className="text-sm text-slate-600">Uploads are reviewed in memory only. Replacing the file clears the previous review.</p>
      {/* Same button sizing as the header's actions. */}
      <div className="editor-actions">
        <button disabled={pending || locked} className="bg-slate-900 px-4 py-2 text-white disabled:opacity-50" type="submit">{pending ? "Reviewing…" : "Review CSV"}</button>
        <button type="button" disabled={locked} onClick={() => { clear(); form.current?.reset(); }} className="secondary disabled:opacity-50">Start over</button>
      </div>
    </form>
    <div role="status" aria-live="polite">{pending ? "Reading and validating CSV…" : outcome.uncertain ? "Import outcome pending. Retry the same request to confirm the saved result." : outcome.inserted !== undefined ? `Imported ${outcome.inserted} businesses; skipped ${outcome.invalid} invalid and ${outcome.duplicate} duplicate records.` : result ? `${result.counts.valid} valid, ${result.counts.invalid} invalid, ${result.counts.duplicate} duplicate records. Nothing has been imported.` : null}</div>
    {outcome.error && <p role="alert" className="rounded-lg bg-amber-50 p-3">{outcome.error}</p>}
    {outcome.inserted !== undefined && <Link className="underline" href="/admin">View imported businesses</Link>}
    {result && outcome.inserted === undefined && <div className="space-y-2 rounded-xl border p-4">
      <p>Confirm saving {result.counts.valid} valid businesses and skipping {result.counts.invalid} invalid and {result.counts.duplicate} duplicate records.</p>
      <p>Existing businesses are not deduplicated. A fresh review and import of this file can create additional records.</p>
      {outcome.uncertain && <p>Keep this page open and retry the same request. Reviewing again creates a separate import.</p>}
      <div className="editor-actions"><button type="button" disabled={confirming || !result.counts.valid || !review.token} onClick={() => void confirm()} className="bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{confirming ? "Confirming…" : outcome.uncertain ? "Retry same import" : "Confirm import"}</button></div>
    </div>}
    {review.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{review.error}</p>}
    {result && <section aria-label="CSV review" className="space-y-4">
      <h3 className="section-heading">Normalized valid records</h3>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">Valid unique business records</caption>
        <thead><tr>{["Record", ...CREATE_BUSINESS_FIELDS].map(field => <th className="border p-2" scope="col" key={field}>{field}</th>)}</tr></thead>
        <tbody>{result.rows.map(row => <tr key={row.record}><th scope="row" className="border p-2">{row.record}</th>{CREATE_BUSINESS_FIELDS.map(field => <td className="max-w-xs break-words border p-2" key={field}>{row.data[field] ?? "—"}</td>)}</tr>)}</tbody>
      </table></div>
      <h3 className="section-heading">Invalid records</h3>
      {result.invalidRows.length ? <ul>{result.invalidRows.map(row => <li key={row.record}>Record {row.record}<ul>{Object.entries(row.fields).map(([field, messages]) => <li key={field}>{field}: {messages.join(" ")}</li>)}</ul></li>)}</ul> : <p>No invalid records.</p>}
      <h3 className="section-heading">Duplicate records</h3>
      {result.duplicates.length ? <ul>{result.duplicates.map(row => <li key={row.record}>Record {row.record} duplicates record {row.firstRecord}.</li>)}</ul> : <p>No duplicates.</p>}
      <p className="text-sm text-slate-600">Record 1 is the first record after the header. Blank records still occupy record numbers. Duplicates compare all normalized fields within this file only.</p>
    </section>}
  </div></>;
}
