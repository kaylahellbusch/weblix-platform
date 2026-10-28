"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getBusinessFormValues,
  getBusinessFieldErrors,
  type BusinessFormState,
} from "@/lib/businesses/form-state";
import { createBusinessForCurrentUser } from "@/lib/businesses/service";
import { parseCreateBusinessInput } from "@/lib/businesses/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateBusinessFormState = BusinessFormState;

export async function createBusinessAction(
  _prevState: CreateBusinessFormState,
  formData: FormData,
): Promise<CreateBusinessFormState> {
  const values = getBusinessFormValues(formData);

  const parsed = parseCreateBusinessInput(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return {
      values,
      fieldErrors: getBusinessFieldErrors(flattened),
      formError: "Please fix the highlighted fields and try again.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await createBusinessForCurrentUser(supabase, parsed.data);

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  if (result.status === "error") {
    return {
      values,
      formError: "We could not save your business. Please try again.",
    };
  }

  // Refreshes the list and the sidebar's business names.
  revalidatePath("/admin", "layout");
  redirect(`/admin/businesses/${result.business.id}`);
}
