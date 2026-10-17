import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { websiteContentSchema, type WebsiteContent } from "./schema";

// Use only the caller's cookie-authenticated client. RLS checks the parent business.
export async function readWebsiteContent(client: SupabaseClient<Database>, businessId: string): Promise<WebsiteContent | null> {
  const { data, error } = await client.from("website_content").select("content")
    .eq("business_id", businessId).maybeSingle();
  if (error) throw new Error("Unable to load website content.");
  return data ? websiteContentSchema.parse(data.content) : null;
}

export async function saveWebsiteContent(client: SupabaseClient<Database>, businessId: string, input: unknown): Promise<void> {
  const content = websiteContentSchema.parse(input);
  const { error } = await client.from("website_content")
    .upsert({ business_id: businessId, content }, { onConflict: "business_id" });
  if (error) throw new Error("Unable to save website content.");
}
