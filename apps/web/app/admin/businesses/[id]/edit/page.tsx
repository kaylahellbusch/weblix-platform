import { EditorShell } from "@/app/ui/editor-shell";
import { EditorNav } from "@/app/ui/editor-nav";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BusinessForm } from "@/app/admin/businesses/business-form";
import { updateBusinessAction } from "@/app/admin/businesses/[id]/actions";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { CREATE_BUSINESS_FIELDS } from "@/lib/businesses/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await createSupabaseServerClient();
  const business = await getBusinessByIdForOwner(supabase, id, user.id);
  if (!business) notFound();

  const initialValues = Object.fromEntries(
    CREATE_BUSINESS_FIELDS.map((field) => [field, business[field] ?? ""]),
  );

  return (
    <EditorShell id={id} name={business.name} current="details">
      <p className="editor-breadcrumb">Businesses / {business.name}</p>
      <h1 className="text-xl font-semibold">Business details</h1>
      <EditorNav id={id} current="details" />
      <BusinessForm
        action={updateBusinessAction.bind(null, id)}
        initialValues={initialValues}
        submitLabel="Save changes"
        cancelHref={`/admin/businesses/${id}`}
      />
    </EditorShell>
  );
}
