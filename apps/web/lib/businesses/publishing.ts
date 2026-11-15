import { z } from "zod";

export const RESERVED_SUBDOMAINS = ["www", "admin", "app", "api", "mail", "preview"] as const;
export const SUBDOMAIN_TAKEN = "This subdomain is already in use. Choose another one.";

// Preserve names exactly as typed: no trimming, lowercasing or automatic renaming.
export const subdomainSchema = z.union([
  z.literal("").transform(() => null),
  z.string()
    .min(3, "Subdomain must be 3 to 40 characters.")
    .max(40, "Subdomain must be 3 to 40 characters.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, digits and single hyphens, with no leading or trailing hyphen.")
    .refine((value) => !RESERVED_SUBDOMAINS.some((reserved) => reserved === value), "This subdomain is reserved. Choose another one."),
]);

export const publishingSchema = z.object({
  subdomain: subdomainSchema,
  published: z.boolean(),
}).refine((value) => !value.published || value.subdomain !== null, {
  path: ["subdomain"], message: "Enter a subdomain before publishing.",
});

export type PublishingInput = z.infer<typeof publishingSchema>;
export class SubdomainTakenError extends Error {
  constructor() { super(SUBDOMAIN_TAKEN); }
}

export function isSubdomainUniqueViolation(error: { code?: string; message?: string }): boolean {
  return error.code === "23505" && Boolean(error.message?.includes('"businesses_subdomain_key"'));
}
