"use client";

import Link from "next/link";
import { useActionState } from "react";
import { deleteBusinessAction } from "@/app/admin/businesses/[id]/actions";
import type { BusinessFormState } from "@/lib/businesses/form-state";

const initialState: BusinessFormState = {};

export function BusinessDeleteForm({ businessId }: { businessId: string }) {
  const [state, action, pending] = useActionState(deleteBusinessAction.bind(null, businessId), initialState);

  return (
    <form action={action} className="space-y-4">
      {state.formError ? <p role="alert" className="text-sm text-red-700">{state.formError}</p> : null}
      <div className="flex items-center gap-4">
        <button type="submit" name="confirm" value="delete" disabled={pending}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-70">
          {pending ? "Deleting..." : "Permanently delete business"}
        </button>
        {pending ? null : <Link href={`/admin/businesses/${businessId}`} className="text-sm font-medium text-blue-700 hover:underline">Cancel</Link>}
      </div>
    </form>
  );
}
