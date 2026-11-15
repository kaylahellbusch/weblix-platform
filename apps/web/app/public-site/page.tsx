import { subdomainSchema } from "@/lib/businesses/publishing";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GranitePreview } from "@/components/granite/preview";
import { publicSubdomain } from "@/lib/website-content/host";
import { readPublicWebsite } from "@/lib/website-content/public";

export const dynamic = "force-dynamic";

export default async function PublicSitePage({ searchParams }: { searchParams: Promise<{ missing?: string }> }) {
  const subdomain = publicSubdomain((await headers()).get("host"), process.env.ROOT_DOMAIN);
  if (!subdomain || !subdomainSchema.safeParse(subdomain).success || (await searchParams).missing) notFound();
  const preview = await readPublicWebsite(subdomain);
  if (!preview) notFound();
  return <GranitePreview preview={preview} publicSite />;
}
