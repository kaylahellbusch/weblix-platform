import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readWebsiteContent } from "@/lib/website-content/repository";
import { saveContentAction } from "./actions";
import { ContentForm } from "./content-form";

export default async function ContentPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const client = await createSupabaseServerClient();
  const business = await getBusinessByIdForOwner(client, id, user.id);
  if (!business) notFound();
  const content = await readWebsiteContent(client, id);
  return <section className="space-y-4">
    <h2 className="text-2xl font-semibold">Website content for {business.name}</h2>
    {(await searchParams).saved === "1" && <p role="status">Website content saved.</p>}
    <ContentForm key={JSON.stringify(content)} initialContent={content ?? { services: [], serviceAreas: [] }}
      action={saveContentAction.bind(null, id)} cancelHref={`/admin/businesses/${id}`} />
  </section>;
}
