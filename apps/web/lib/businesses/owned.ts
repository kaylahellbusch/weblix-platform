import { cache } from "react";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner, listBusinessesByOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** The signed-in owner's business, loaded once per request. */
export const getOwnedBusiness = cache(async (id: string) => {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  return getBusinessByIdForOwner(supabase, id, user.id);
});

/** The signed-in owner's businesses, loaded once per request and shared by the admin layout's sidebar and the list page. */
export const getOwnedBusinesses = cache(async () => {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  return listBusinessesByOwner(supabase, user.id);
});
