import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { CreateBusinessInput } from "@/lib/businesses/schema";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

type AppSupabaseClient = SupabaseClient<Database>;

export async function listBusinessesByOwner(
  supabase: AppSupabaseClient,
  ownerId: string,
): Promise<Business[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load businesses.");
  }

  return data;
}

export async function getBusinessByIdForOwner(
  supabase: AppSupabaseClient,
  businessId: string,
  ownerId: string,
): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("id", businessId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load business.");
  }

  return data;
}

export async function createBusinessForOwner(
  supabase: AppSupabaseClient,
  ownerId: string,
  input: CreateBusinessInput,
): Promise<Business> {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: ownerId,
      name: input.name,
      industry: input.industry,
      phone: input.phone ?? null,
      email: input.email ?? null,
      website: input.website ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Unable to create business.");
  }

  return data;
}
