import { z } from "zod";
import type { Business } from "@/lib/businesses/repository";
import { websiteContentSchema, type WebsiteContent } from "./schema";

export type PreviewBusinessFacts = Pick<Business,
  "name" | "industry" | "phone" | "email" | "website" | "city" | "state"
>;

export type WebsitePreview = {
  business: PreviewBusinessFacts;
  headline: string;
  introduction?: string;
  services?: WebsiteContent["services"];
  serviceAreas?: WebsiteContent["serviceAreas"];
  actions: { phone?: string; email?: string; website?: string };
};

/** Validates optional content and returns a fresh, side-effect-free preview model. */
export function toWebsitePreview(
  business: PreviewBusinessFacts,
  content?: unknown,
): WebsitePreview {
  const parsed = websiteContentSchema.parse(content === undefined ? {} : content);
  const actions: WebsitePreview["actions"] = {};
  const phone = business.phone?.trim();
  // Conservative dialable subset; arbitrary stored text must not become a URI.
  if (phone && /^\+?[0-9 () .-]+$/.test(phone) && /[0-9]/.test(phone)) {
    actions.phone = `tel:${phone.replace(/[ () .-]/g, "")}`;
  }
  const email = business.email?.trim();
  if (email && z.email().safeParse(email).success) {
    actions.email = `mailto:${encodeURIComponent(email)}`;
  }
  const website = business.website?.trim();
  if (website && z.url({ protocol: /^https?$/ }).safeParse(website).success) {
    actions.website = website;
  }
  return {
    business: { ...business },
    headline: parsed.headline ?? business.name,
    ...(parsed.introduction ? { introduction: parsed.introduction } : {}),
    ...(parsed.services.length ? { services: parsed.services } : {}),
    ...(parsed.serviceAreas.length ? { serviceAreas: parsed.serviceAreas } : {}),
    actions,
  };
}
