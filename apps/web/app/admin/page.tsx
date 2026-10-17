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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Your businesses</h2>
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

      {!hasLoadError && businesses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-700">No businesses yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first business to get started.
          </p>
        </div>
      ) : null}

      {!hasLoadError && businesses.length > 0 ? (
        <ul className="space-y-3">
          {businesses.map((business) => (
            <li key={business.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{business.name}</p>
                  <p className="text-sm text-slate-600">{business.industry}</p>
                </div>
                <Link
                  href={`/admin/businesses/${business.id}`}
                  className="text-sm font-medium text-blue-700 hover:underline"
                >
                  View details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
