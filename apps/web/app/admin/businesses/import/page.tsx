import { requireAuthenticatedUser } from "@/lib/auth/user";
import { CsvImportForm } from "./upload-form";

export default async function ImportPage() {
  await requireAuthenticatedUser();
  return <section className="space-y-4">
    <h1 className="text-xl font-semibold">Review a business CSV</h1>
    <p>Review first, then explicitly confirm saving valid records. Reviewing and canceling do not save businesses.</p>
    <p>Use UTF-8 CSV, up to 1 MiB and 500 nonblank data records. Required headers: name, industry. Optional headers: phone, email, website, city, state. Headers are case-sensitive. Quote values containing commas, quotes or newlines.</p>
    <a className="text-blue-700 underline" href="/admin/businesses/import/sample" download>Download sample CSV</a>
    <CsvImportForm />
  </section>;
}
