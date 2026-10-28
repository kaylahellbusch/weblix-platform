import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteBusinessDialog } from "../delete-business-dialog";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusiness } from "@/lib/businesses/owned";

export default async function BusinessSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const business = await getOwnedBusiness(id);
  if (!business) notFound();

  return (
    <>
      <header className="editor-header">
        <div><h1>{business.name}</h1><h2 className="editor-subtitle">Settings</h2></div>
      </header>
      <section aria-labelledby="delete-business-title" className="space-y-3 rounded-xl border border-red-200 bg-white p-6">
        <h3 id="delete-business-title" className="section-heading">Delete business</h3>
        <p className="text-slate-700">Permanently delete {business.name} and its website content. This cannot be undone.</p>
        <DeleteBusinessDialog businessId={id} businessName={business.name} />
      </section>
    </>
  );
}
