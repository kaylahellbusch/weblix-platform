"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/auth/user";
import { getBusinessByIdForOwner } from "@/lib/businesses/repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { websiteContentSchema } from "@/lib/website-content/schema";
import { saveWebsiteContent } from "@/lib/website-content/repository";
import type { ContentFormState } from "@/lib/website-content/form-state";

export async function saveContentAction(businessId: string, _state: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const user = await requireAuthenticatedUser();
  if (!z.string().uuid().safeParse(businessId).success) notFound();
  const client = await createSupabaseServerClient();
  let business;
  try {
    business = await getBusinessByIdForOwner(client, businessId, user.id);
  } catch {
    return { formError: "We could not check access. Please try again." };
  }
  if (!business) notFound();

  let input: unknown;
  try {
    const raw = formData.get("content");
    if (typeof raw !== "string") throw new Error();
    input = JSON.parse(raw);
  } catch {
    return { formError: "Invalid content submission. Please try again." };
  }
  const parsed = websiteContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      formError: "Please fix the highlighted fields and try again.",
      errors: parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })),
    };
  }
  try {
    await saveWebsiteContent(client, businessId, parsed.data);
  } catch {
    return { formError: "We could not save your content. Your edits are still here; please try again." };
  }
  revalidatePath(`/admin/businesses/${businessId}/content`);
  redirect(`/admin/businesses/${businessId}/content?saved=1`);
}
