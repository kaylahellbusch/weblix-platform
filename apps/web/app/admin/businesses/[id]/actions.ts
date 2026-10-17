"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import {
  getBusinessFieldErrors,
  getBusinessFormValues,
  type BusinessFormState,
} from "@/lib/businesses/form-state";
import { parseCreateBusinessInput } from "@/lib/businesses/schema";
import {
  updateBusinessForCurrentUser,
  deleteBusinessForCurrentUser,
} from "@/lib/businesses/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updateBusinessAction(
  businessId: string,
  _previousState: BusinessFormState,
  formData: FormData,
): Promise<BusinessFormState> {
  if (!z.string().uuid().safeParse(businessId).success) notFound();
  const values = getBusinessFormValues(formData);
  const parsed = parseCreateBusinessInput(formData);
  if (!parsed.success) {
    return {
      values,
      fieldErrors: getBusinessFieldErrors(parsed.error.flatten().fieldErrors),
      formError: "Please fix the highlighted fields and try again.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const result = await updateBusinessForCurrentUser(supabase, businessId, parsed.data);
  if (result.status === "unauthenticated") redirect("/login");
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    return { values, formError: "We could not save your changes. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/businesses/${businessId}`);
  revalidatePath(`/admin/businesses/${businessId}/edit`);
  redirect(`/admin/businesses/${businessId}`);
}

export async function deleteBusinessAction(
  businessId: string,
  _previousState: BusinessFormState,
  formData: FormData,
): Promise<BusinessFormState> {
  if (!z.string().uuid().safeParse(businessId).success) notFound();
  if (formData.get("confirm") !== "delete") {
    return { formError: "Confirm deletion to delete this business." };
  }

  const supabase = await createSupabaseServerClient();
  const result = await deleteBusinessForCurrentUser(supabase, businessId);
  if (result.status === "unauthenticated") redirect("/login");
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    return { formError: "We could not delete this business. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/businesses/${businessId}`, "layout");
  redirect("/admin");
}
