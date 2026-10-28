import { requireAuthenticatedUser } from "@/lib/auth/user";
import { CsvImportForm } from "./upload-form";

export default async function ImportPage() {
  await requireAuthenticatedUser();
  return <CsvImportForm>
    <section aria-labelledby="csv-requirements-title" className="import-intro">
      <h2 id="csv-requirements-title" className="section-heading">Import businesses from a CSV file</h2>
      <p>You review the file first. Nothing is saved until you confirm the import, and canceling saves nothing.</p>
      <ul>
        <li>UTF-8 CSV, up to 1 MiB and 500 nonblank data records.</li>
        <li>Required headers: name, industry. Optional headers: phone, email, website, city, state.</li>
        <li>Headers are case-sensitive. Quote values containing commas, quotes or newlines.</li>
      </ul>
      <a href="/admin/businesses/import/sample" download>Download sample CSV</a>
    </section>
  </CsvImportForm>;
}
