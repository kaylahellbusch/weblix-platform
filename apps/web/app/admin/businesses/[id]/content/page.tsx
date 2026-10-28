import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusiness } from "@/lib/businesses/owned";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readWebsiteContent } from "@/lib/website-content/repository";
import { saveContentAction } from "./actions";
import { ContentForm } from "./content-form";

export default async function ContentPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const business = await getOwnedBusiness(id);
  if (!business) notFound();
  const content = await readWebsiteContent(await createSupabaseServerClient(), id);
  return <ContentForm key={id} businessName={business.name} initialContent={content ?? { services: [], serviceAreas: [] }}
    action={saveContentAction.bind(null, id)} cancelHref={`/admin/businesses/${id}`} />;
}
