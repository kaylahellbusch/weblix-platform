"use client";

import { useActionState } from "react";
import {
  createBusinessAction,
  initialCreateBusinessFormState,
} from "@/app/admin/businesses/new/actions";

export function BusinessCreateForm() {
  const [state, action, pending] = useActionState(
    createBusinessAction,
    initialCreateBusinessFormState,
  );

  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Business name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={state.values?.name ?? ""}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.name ? (
          <p className="mt-1 text-sm text-red-700">{state.fieldErrors.name}</p>
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.industry ? (
          <p className="mt-1 text-sm text-red-700">{state.fieldErrors.industry}</p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.phone ? (
            <p className="mt-1 text-sm text-red-700">{state.fieldErrors.phone}</p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.email ? (
            <p className="mt-1 text-sm text-red-700">{state.fieldErrors.email}</p>
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
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
        />
        {state.fieldErrors?.website ? (
          <p className="mt-1 text-sm text-red-700">{state.fieldErrors.website}</p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.city ? (
            <p className="mt-1 text-sm text-red-700">{state.fieldErrors.city}</p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring"
          />
          {state.fieldErrors?.state ? (
            <p className="mt-1 text-sm text-red-700">{state.fieldErrors.state}</p>
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
        {pending ? "Saving..." : "Create business"}
      </button>
    </form>
  );
}
