"use server";

import { redirect } from "next/navigation";
import { createBusinessForCurrentUser } from "@/lib/businesses/service";
import {
  CREATE_BUSINESS_FIELDS,
  parseCreateBusinessInput,
} from "@/lib/businesses/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateBusinessFormState = {
  formError?: string;
  fieldErrors?: Partial<Record<(typeof CREATE_BUSINESS_FIELDS)[number], string>>;
  values?: Partial<Record<(typeof CREATE_BUSINESS_FIELDS)[number], string>>;
};

export const initialCreateBusinessFormState: CreateBusinessFormState = {};

export async function createBusinessAction(
  _prevState: CreateBusinessFormState,
  formData: FormData,
): Promise<CreateBusinessFormState> {
  const values = Object.fromEntries(
    CREATE_BUSINESS_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  ) as Record<(typeof CREATE_BUSINESS_FIELDS)[number], string>;

  const parsed = parseCreateBusinessInput(formData);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;

    return {
      values,
      fieldErrors: {
        name: flattened.name?.[0],
        industry: flattened.industry?.[0],
        phone: flattened.phone?.[0],
        email: flattened.email?.[0],
        website: flattened.website?.[0],
        city: flattened.city?.[0],
        state: flattened.state?.[0],
      },
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

  redirect(`/admin/businesses/${result.business.id}`);
}
