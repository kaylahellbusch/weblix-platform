import { CREATE_BUSINESS_FIELDS } from "@/lib/businesses/schema";

export const EDIT_BUSINESS_FIELDS = [...CREATE_BUSINESS_FIELDS, "subdomain", "published"] as const;
type BusinessField = (typeof EDIT_BUSINESS_FIELDS)[number];
export type BusinessFormValues = Partial<Record<BusinessField, string>>;
export type BusinessFormState = {
  formError?: string;
  fieldErrors?: Partial<Record<BusinessField, string>>;
  values?: BusinessFormValues;
};

export function getBusinessFormValues(formData: FormData): BusinessFormValues {
  return Object.fromEntries(
    EDIT_BUSINESS_FIELDS.map((field) => [field, String(formData.get(field) ?? "")]),
  );
}

export function getBusinessFieldErrors(errors: Partial<Record<BusinessField, string[]>>) {
  return Object.fromEntries(
    EDIT_BUSINESS_FIELDS.map((field) => [field, errors[field]?.[0]]),
  ) as BusinessFormState["fieldErrors"];
}
