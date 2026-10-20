"use client";

import Link from "next/link";
import { useActionState, useState, type SetStateAction } from "react";
import type { WebsiteContent } from "@/lib/website-content/schema";
import type { ContentFormState } from "@/lib/website-content/form-state";

type Props = {
  initialContent: WebsiteContent;
  action: (state: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  cancelHref: string;
};

export function ContentForm({ initialContent, action: submitAction, cancelHref }: Props) {
  const [values, setDraftValues] = useState(initialContent);
  const [edited, setEdited] = useState(false);
  function setValues(next: SetStateAction<WebsiteContent>) {
    setEdited(true);
    setDraftValues(next);
  }
  const [state, action, pending] = useActionState(async (previous: ContentFormState, data: FormData) => {
    const result = await submitAction(previous, data);
    if (result.saved) setEdited(false);
    return result;
  }, {});
  const inputClass = "block w-full rounded border border-slate-300 p-2";
  const buttonClass = "rounded border border-slate-400 px-3 py-1 disabled:opacity-50";
  const errorFor = (path: string) => state.errors?.filter(error => error.path === path).map(error => error.message).join(" ");
  function error(path: string) {
    return errorFor(path) ? <p id={`${path}-error`} className="text-red-700">{errorFor(path)}</p> : null;
  }
  function accessibility(path: string) {
    return { "aria-invalid": Boolean(errorFor(path)), "aria-describedby": errorFor(path) ? `${path}-error` : undefined };
  }
  function move(list: "services" | "serviceAreas", index: number, direction: number) {
    setValues(current => {
      const items = [...current[list]];
      [items[index], items[index + direction]] = [items[index + direction], items[index]];
      return { ...current, [list]: items };
    });
  }
  // Controlled fields retain the exact entered values after server errors.
  return <form action={action} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
    {state.saved && !edited && !pending && !state.formError && <p role="status">Website content saved.</p>}
    <input type="hidden" name="content" value={JSON.stringify(values)} />
    <fieldset disabled={pending} className="space-y-6">
      <legend className="sr-only">Website content</legend>
      <p className="text-sm text-slate-600">All sections are optional. Services and areas appear in the order shown. Saving replaces the entire content; the last save wins.</p>
      <div>
        <label htmlFor="headline">Headline (up to 160 characters)</label>
        <input id="headline" className={inputClass} value={values.headline ?? ""} {...accessibility("headline")}
          onChange={event => setValues({ ...values, headline: event.target.value })} />
        {error("headline")}
      </div>
      <div>
        <label htmlFor="introduction">Introduction (up to 2,000 characters)</label>
        <textarea id="introduction" rows={5} className={inputClass} value={values.introduction ?? ""} {...accessibility("introduction")}
          onChange={event => setValues({ ...values, introduction: event.target.value })} />
        {error("introduction")}
      </div>
      <section aria-labelledby="services-label" className="space-y-3">
        <h3 id="services-label" className="font-semibold">Services (up to 20)</h3>
        {error("services")}
        {values.services.length === 0 && <p>No services added.</p>}
        {values.services.map((service, index) => <fieldset key={index} className="space-y-2 rounded border p-3">
          <legend>Service {index + 1}</legend>
          <label htmlFor={`services.${index}.title`}>Service {index + 1} title (up to 120 characters)</label>
          <input id={`services.${index}.title`} className={inputClass} value={service.title} {...accessibility(`services.${index}.title`)}
            onChange={event => setValues({ ...values, services: values.services.map((item, i) => i === index ? { ...item, title: event.target.value } : item) })} />
          {error(`services.${index}.title`)}
          <label htmlFor={`services.${index}.description`}>Service {index + 1} description (up to 1,000 characters)</label>
          <textarea id={`services.${index}.description`} className={inputClass} value={service.description} {...accessibility(`services.${index}.description`)}
            onChange={event => setValues({ ...values, services: values.services.map((item, i) => i === index ? { ...item, description: event.target.value } : item) })} />
          {error(`services.${index}.description`)}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} aria-label={`Move service ${index + 1} up`} disabled={index === 0} onClick={() => move("services", index, -1)}>Move up</button>
            <button type="button" className={buttonClass} aria-label={`Move service ${index + 1} down`} disabled={index === values.services.length - 1} onClick={() => move("services", index, 1)}>Move down</button>
            <button type="button" className={buttonClass} onClick={() => setValues({ ...values, services: values.services.filter((_, i) => i !== index) })}>Remove service {index + 1}</button>
          </div>
        </fieldset>)}
        <button type="button" className={buttonClass} disabled={values.services.length >= 20}
          onClick={() => setValues({ ...values, services: [...values.services, { title: "", description: "" }] })}>Add service</button>
      </section>
      <section aria-labelledby="areas-label" className="space-y-3">
        <h3 id="areas-label" className="font-semibold">Service areas (up to 50)</h3>
        {error("serviceAreas")}
        {values.serviceAreas.length === 0 && <p>No service areas added.</p>}
        {values.serviceAreas.map((area, index) => <div key={index} className="space-y-2 rounded border p-3">
          <label htmlFor={`serviceAreas.${index}`}>Service area {index + 1} (up to 120 characters)</label>
          <input id={`serviceAreas.${index}`} className={inputClass} value={area} {...accessibility(`serviceAreas.${index}`)}
            onChange={event => setValues({ ...values, serviceAreas: values.serviceAreas.map((item, i) => i === index ? event.target.value : item) })} />
          {error(`serviceAreas.${index}`)}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass} aria-label={`Move service area ${index + 1} up`} disabled={index === 0} onClick={() => move("serviceAreas", index, -1)}>Move up</button>
            <button type="button" className={buttonClass} aria-label={`Move service area ${index + 1} down`} disabled={index === values.serviceAreas.length - 1} onClick={() => move("serviceAreas", index, 1)}>Move down</button>
            <button type="button" className={buttonClass} onClick={() => setValues({ ...values, serviceAreas: values.serviceAreas.filter((_, i) => i !== index) })}>Remove service area {index + 1}</button>
          </div>
        </div>)}
        <button type="button" className={buttonClass} disabled={values.serviceAreas.length >= 50}
          onClick={() => setValues({ ...values, serviceAreas: [...values.serviceAreas, ""] })}>Add service area</button>
      </section>
      {state.formError && <div role="alert" className="rounded bg-red-50 p-3 text-red-700">
        <p>{state.formError}</p>
        {state.errors?.filter(item => !/^(headline|introduction|services|serviceAreas)(\.|$)/.test(item.path)).map((item, index) => <p key={index}>{item.message}</p>)}
      </div>}
      <div className="flex gap-4">
        <button type="submit" disabled={pending} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{pending ? "Saving..." : "Save website content"}</button>
        <Link href={cancelHref} className="py-2 text-blue-700 hover:underline">Cancel</Link>
      </div>
    </fieldset>
  </form>;
}
