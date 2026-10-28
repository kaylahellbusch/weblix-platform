import { BusinessViews } from "./business-views";
import Link from "next/link";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusinesses } from "@/lib/businesses/owned";

export default async function AdminPage() {
  await requireAuthenticatedUser();
  let businesses = [] as Awaited<ReturnType<typeof getOwnedBusinesses>>;
  let hasLoadError = false;

  try {
    businesses = await getOwnedBusinesses();
  } catch {
    hasLoadError = true;
  }

  return (
    <section className="business-page">
      <div className="page-heading">
        <div><h1>Your businesses</h1><p className="page-description">Manage business details and saved website content.</p></div>
        <Link
          href="/admin/businesses/new"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <span aria-hidden="true">＋</span> Add business
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
