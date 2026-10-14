import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { CreateBusinessInput } from "@/lib/businesses/schema";
import {
  createBusinessForOwner,
  getBusinessByIdForOwner,
  listBusinessesByOwner,
  type Business,
} from "@/lib/businesses/repository";

type AppSupabaseClient = SupabaseClient<Database>;

export type CreateBusinessResult =
  | { status: "success"; business: Business }
  | { status: "unauthenticated" }
  | { status: "error" };

export async function createBusinessForCurrentUser(
  supabase: AppSupabaseClient,
  input: CreateBusinessInput,
): Promise<CreateBusinessResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  try {
    const business = await createBusinessForOwner(supabase, user.id, input);
    return { status: "success", business };
  } catch {
    return { status: "error" };
  }
}

export async function listBusinessesForCurrentUser(
  supabase: AppSupabaseClient,
): Promise<Business[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return listBusinessesByOwner(supabase, user.id);
}

export async function getBusinessForCurrentUser(
  supabase: AppSupabaseClient,
  businessId: string,
): Promise<Business | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getBusinessByIdForOwner(supabase, businessId, user.id);
}
