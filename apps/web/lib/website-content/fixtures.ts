import type { PreviewBusinessFacts } from "./preview";
import type { WebsiteContent } from "./schema";

export const exampleBusiness: PreviewBusinessFacts = {
  name: "Example Roofing", industry: "roofing", phone: "+1 (208) 555-0100",
  email: "hello@example.com", website: "https://example.com", city: "Example City", state: "ID",
};
export const populatedContent: WebsiteContent = {
  headline: "Roofing for Example City",
  introduction: "Learn about our roofing services.",
  services: [
    { title: "Roof repairs", description: "Repair options for your roof." },
    { title: "Roof replacement", description: "Discuss replacement options." },
  ],
  serviceAreas: ["Example City", "Sample Town"],
};
export const missingContent = {};
export const businessWithoutContacts: PreviewBusinessFacts = {
  ...exampleBusiness, phone: null, email: null, website: null,
};
