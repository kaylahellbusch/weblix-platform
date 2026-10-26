import { EditorNav } from "@/app/ui/editor-nav";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readWebsiteContent } from "@/lib/website-content/repository";
import { saveContentAction } from "./actions";
import { ContentForm } from "./content-form";

export default async function ContentPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const client = await createSupabaseServerClient();
  const business = await getBusinessByIdForOwner(client, id, user.id);
  if (!business) notFound();
  const content = await readWebsiteContent(client, id);
  return <section className="space-y-4">
    <h1 className="text-2xl font-semibold">Website content for {business.name}</h1>
    <EditorNav id={id} current="content" />
    <ContentForm key={id} initialContent={content ?? { services: [], serviceAreas: [] }}
      action={saveContentAction.bind(null, id)} cancelHref={`/admin/businesses/${id}`} />
  </section>;
}
