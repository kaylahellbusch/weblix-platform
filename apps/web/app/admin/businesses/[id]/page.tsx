import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    notFound();
  }

  const business = await getBusinessByIdForOwner(supabase, parsed.data.id, user.id);

  if (!business) {
    notFound();
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{business.name}</h2>
          <p className="text-sm text-slate-600">{business.industry}</p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-blue-700 hover:underline">
          Back to list
        </Link>
      </div>

      <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-slate-900">Phone</dt>
          <dd>{business.phone ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Email</dt>
          <dd>{business.email ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">Website</dt>
          <dd>{business.website ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">City</dt>
          <dd>{business.city ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-900">State</dt>
          <dd>{business.state ?? "Not provided"}</dd>
        </div>
      </dl>
    </section>
  );
}
