"use client";

import { useActionState, useRef } from "react";
import { deleteBusinessAction } from "@/app/admin/businesses/[id]/actions";
import type { BusinessFormState } from "@/lib/businesses/form-state";

const initialState: BusinessFormState = {};

export function DeleteBusinessDialog({ businessId, businessName }: { businessId: string; businessName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(deleteBusinessAction.bind(null, businessId), initialState);

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
        Delete business
      </button>
      <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
        onCancel={(event) => { if (pending) event.preventDefault(); }}>
        <h2 id="delete-title">Delete {businessName}?</h2>
        <p id="delete-description">This permanently deletes the business. This cannot be undone.</p>
        <form action={action}>
          {state.formError ? <p role="alert" className="text-sm text-red-700">{state.formError}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="secondary" autoFocus disabled={pending} onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button type="submit" name="confirm" value="delete" disabled={pending}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-70">
              {pending ? "Deleting..." : "Permanently delete business"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
