import { z } from "zod";

const optionalTrimmedText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().max(255).optional());

export const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Business name is required.")
    .max(120, "Business name must be 120 characters or less."),
  industry: z
    .string()
    .trim()
    .min(1, "Industry is required.")
    .max(120, "Industry must be 120 characters or less."),
  phone: optionalTrimmedText,
  email: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().email("Enter a valid email address.").optional(),
  ),
  website: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z
      .string()
      .url("Enter a valid URL, including http:// or https://.")
      .optional(),
  ),
  city: optionalTrimmedText,
  state: optionalTrimmedText,
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export const CREATE_BUSINESS_FIELDS = [
  "name",
  "industry",
  "phone",
  "email",
  "website",
  "city",
  "state",
] as const;

export function parseCreateBusinessInput(formData: FormData) {
  return createBusinessSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry") ?? "roofing",
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    city: formData.get("city"),
    state: formData.get("state"),
  });
}
