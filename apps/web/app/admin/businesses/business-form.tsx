"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useUnsavedChanges } from "@/app/ui/use-unsaved-changes";
import type { BusinessFormState, BusinessFormValues } from "@/lib/businesses/form-state";

type BusinessFormProps = {
  action: (state: BusinessFormState, formData: FormData) => Promise<BusinessFormState>;
  initialValues?: BusinessFormValues;
  submitLabel: string;
  cancelHref?: string;
};

export function BusinessForm({ action: submitAction, initialValues, submitLabel, cancelHref }: BusinessFormProps) {
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  const [state, action, pending] = useActionState(submitAction, { values: initialValues });

  const formKey = JSON.stringify(state.values ?? {});

  return (
    <form
      key={formKey}
      onChange={() => setDirty(true)}
      action={action}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Business name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={state.values?.name ?? ""}
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.name ? (
          <p id="name-error" className="mt-1 text-sm text-red-700">
            {state.fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="industry" className="mb-1 block text-sm font-medium text-slate-700">
          Industry
        </label>
        <input
          id="industry"
          name="industry"
          defaultValue={state.values?.industry ?? "roofing"}
          required
          aria-invalid={Boolean(state.fieldErrors?.industry)}
          aria-describedby={state.fieldErrors?.industry ? "industry-error" : undefined}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.industry ? (
          <p id="industry-error" className="mt-1 text-sm text-red-700">
            {state.fieldErrors.industry}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={state.values?.phone ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.phone)}
            aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.phone ? (
            <p id="phone-error" className="mt-1 text-sm text-red-700">
              {state.fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.values?.email ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.email ? (
            <p id="email-error" className="mt-1 text-sm text-red-700">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="website" className="mb-1 block text-sm font-medium text-slate-700">
          Website
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={state.values?.website ?? ""}
          aria-invalid={Boolean(state.fieldErrors?.website)}
          aria-describedby={state.fieldErrors?.website ? "website-error" : undefined}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.website ? (
          <p id="website-error" className="mt-1 text-sm text-red-700">
            {state.fieldErrors.website}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">
            City
          </label>
          <input
            id="city"
            name="city"
            defaultValue={state.values?.city ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.city)}
            aria-describedby={state.fieldErrors?.city ? "city-error" : undefined}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.city ? (
            <p id="city-error" className="mt-1 text-sm text-red-700">
              {state.fieldErrors.city}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium text-slate-700">
            State
          </label>
          <input
            id="state"
            name="state"
            defaultValue={state.values?.state ?? ""}
            aria-invalid={Boolean(state.fieldErrors?.state)}
            aria-describedby={state.fieldErrors?.state ? "state-error" : undefined}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.state ? (
            <p id="state-error" className="mt-1 text-sm text-red-700">
              {state.fieldErrors.state}
            </p>
          ) : null}
        </div>
      </div>

      {state.formError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
      {cancelHref ? (
        <Link href={cancelHref} className="ml-4 text-sm font-medium text-blue-700 hover:underline">
          Cancel
        </Link>
      ) : null}
    </form>
  );
}
