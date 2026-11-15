import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "@/lib/supabase/env";
import { toWebsitePreview } from "./preview";

export async function readPublicWebsite(subdomain: string) {
  const { url, publishableKey } = getSupabaseConfig();
  // Never use a visitor's cookies or a privileged key for public rendering.
  const client = createClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  const { data, error } = await client.rpc("read_public_website", { site_subdomain: subdomain }).maybeSingle();
  if (error) throw new Error("Unable to load public website.");
  return data ? toWebsitePreview(data, data.content) : null;
}
