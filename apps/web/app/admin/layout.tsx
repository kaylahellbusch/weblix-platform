import type { ReactNode } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/admin/actions";
import { requireAuthenticatedUser } from "@/lib/auth/user";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAuthenticatedUser();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin</h1>
            <p className="text-sm text-slate-600">Signed in as {user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Businesses
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
