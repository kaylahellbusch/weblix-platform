import { notFound } from "next/navigation";
import { z } from "zod";
import { BusinessDeleteForm } from "@/app/admin/businesses/[id]/delete/business-delete-form";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DeleteBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await createSupabaseServerClient();
  const business = await getBusinessByIdForOwner(supabase, id, user.id);
  if (!business) notFound();

  return (
    <section className="space-y-4 rounded-xl border border-red-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Delete {business.name}?</h2>
      <p className="text-sm text-slate-700">This permanently deletes the business. This cannot be undone.</p>
      <BusinessDeleteForm businessId={id} />
    </section>
  );
}
