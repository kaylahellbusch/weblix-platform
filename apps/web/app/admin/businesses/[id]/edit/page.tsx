import { notFound } from "next/navigation";
import { z } from "zod";
import { BusinessForm } from "@/app/admin/businesses/business-form";
import { updateBusinessAction } from "@/app/admin/businesses/[id]/actions";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusiness } from "@/lib/businesses/owned";
import { CREATE_BUSINESS_FIELDS } from "@/lib/businesses/schema";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const business = await getOwnedBusiness(id);
  if (!business) notFound();

  const initialValues = Object.fromEntries(
    CREATE_BUSINESS_FIELDS.map((field) => [field, business[field] ?? ""]),
  );

  return (
    <BusinessForm
      action={updateBusinessAction.bind(null, id)}
      initialValues={initialValues}
      submitLabel="Save changes"
      cancelHref={`/admin/businesses/${id}`}
      title={business.name}
      subtitle="Edit business details"
    />
  );
}
