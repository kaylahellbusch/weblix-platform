"use client";

import { BusinessForm } from "@/app/admin/businesses/business-form";
import { createBusinessAction } from "@/app/admin/businesses/new/actions";

export function BusinessCreateForm() {
  return <BusinessForm action={createBusinessAction} submitLabel="Create business" />;
}
