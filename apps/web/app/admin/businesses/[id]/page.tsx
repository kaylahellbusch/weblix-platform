import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusiness } from "@/lib/businesses/owned";

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const business = await getOwnedBusiness(id);
  if (!business) notFound();

  const fields = [
    ["Business name", business.name],
    ["Industry", business.industry],
    ["Phone", business.phone],
    ["Email", business.email],
    ["Website", business.website],
    ["City", business.city],
    ["State", business.state],
  ] as const;

  return (
    <>
      <header className="editor-header">
        <div><h1>{business.name}</h1><h2 className="editor-subtitle">Business details</h2></div>
        <div className="editor-actions">
          <Link href={`/admin/businesses/${id}/edit`} className="bg-slate-900 px-4 py-2 text-white">Edit details</Link>
        </div>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="mb-1 text-sm font-medium text-slate-700">{label}</dt>
              <dd className="break-words text-slate-900">
                {value || <span className="text-slate-500"><span aria-hidden="true">—</span><span className="sr-only">Not provided</span></span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
