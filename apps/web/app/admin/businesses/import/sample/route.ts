import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAuthenticatedUser } from "@/lib/auth/user";

export async function GET() {
  await requireAuthenticatedUser();
  const sample = await readFile(path.join(process.cwd(), "lib/business-csv/fixtures/sample.csv"), "utf8");
  return new Response(sample, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="business-sample.csv"',
    "Cache-Control": "no-store",
  } });
}
