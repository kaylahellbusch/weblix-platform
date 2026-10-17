import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );

/** Text is literal plain text. Consumers must render it as text, never HTML. */
export const websiteContentSchema = z.strictObject({
  headline: optionalText(160),
  introduction: optionalText(2000),
  services: z.array(z.strictObject({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(1000),
  })).max(20).default([]),
  serviceAreas: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
});

export type WebsiteContent = z.infer<typeof websiteContentSchema>;
