import { BusinessViews } from "./business-views";
import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { listBusinessesByOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();

  let businesses = [] as Awaited<ReturnType<typeof listBusinessesByOwner>>;
  let hasLoadError = false;

  try {
    businesses = await listBusinessesByOwner(supabase, user.id);
  } catch {
    hasLoadError = true;
  }

  return (
    <section className="space-y-4">
      <div className="page-heading">
        <div><h1>Your businesses</h1><p className="page-description">Manage business details and saved website content.</p></div>
        <Link href="/admin/businesses/import" className="text-sm font-medium text-blue-700 hover:underline">Review CSV</Link>
        <Link
          href="/admin/businesses/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add business
        </Link>
      </div>

      {hasLoadError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          We could not load businesses right now. Please refresh and try again.
        </p>
      ) : null}

      {!hasLoadError && <BusinessViews businesses={businesses} />}
    </section>
  );
}
