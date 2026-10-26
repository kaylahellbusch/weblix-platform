import Link from "next/link";
import { BusinessCreateForm } from "@/app/admin/businesses/new/business-create-form";
import { requireAuthenticatedUser } from "@/lib/auth/user";

export default async function NewBusinessPage() {
  await requireAuthenticatedUser();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Add business</h1>
        <Link href="/admin" className="text-sm font-medium text-blue-700 hover:underline">
          Back to list
        </Link>
      </div>

      <BusinessCreateForm />
    </section>
  );
}
