import { toWebsitePreview } from "./preview";
import { exampleBusiness, businessWithoutContacts, populatedContent } from "./fixtures";
console.log(JSON.stringify({
  minimal: toWebsitePreview(businessWithoutContacts),
  populated: toWebsitePreview(exampleBusiness, populatedContent),
  invalidContacts: toWebsitePreview({ ...exampleBusiness, phone: "call us", email: "invalid", website: "javascript:alert(1)" }),
}, null, 2));
