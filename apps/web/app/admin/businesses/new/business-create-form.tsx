"use client";

import { BusinessForm } from "@/app/admin/businesses/business-form";
import { createBusinessAction } from "@/app/admin/businesses/new/actions";
import { AddBusinessTabs } from "@/app/admin/businesses/add-business-tabs";

export function BusinessCreateForm() {
  return <BusinessForm action={createBusinessAction} submitLabel="Create business" cancelHref="/admin" title="Add business" tabs={<AddBusinessTabs />} />;
}
