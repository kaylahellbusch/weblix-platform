import { BusinessCreateForm } from "@/app/admin/businesses/new/business-create-form";
import { requireAuthenticatedUser } from "@/lib/auth/user";

export default async function NewBusinessPage() {
  await requireAuthenticatedUser();

  return <BusinessCreateForm />;
}
