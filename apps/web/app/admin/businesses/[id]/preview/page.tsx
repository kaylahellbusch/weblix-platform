import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getOwnedBusiness } from "@/lib/businesses/owned";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readWebsiteContent } from "@/lib/website-content/repository";
import { toWebsitePreview } from "@/lib/website-content/preview";
import { GranitePreview } from "@/components/granite/preview";

export const metadata = { title: "Website preview | Weblix", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthenticatedUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const business = await getOwnedBusiness(id);
  if (!business) notFound();
  const content = await readWebsiteContent(await createSupabaseServerClient(), id);
  return <GranitePreview preview={toWebsitePreview(business, content ?? undefined)} />;
}
