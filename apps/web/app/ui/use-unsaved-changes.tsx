"use client";
import { useEffect, useRef, useState } from "react";

type Navigation = EventTarget & { traverseTo: (key: string) => void };

/** Protect workspace navigation; keep browser-native protection for reload/close. */
export function useUnsavedChanges(dirty: boolean) {
  const [pending, setPending] = useState<{ proceed: () => void } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const leaving = useRef(false);
  useEffect(() => {
    if (!pending) return;
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, [pending]);
  useEffect(() => {
    leaving.current = false;
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!leaving.current) event.preventDefault();
    }
    function click(event: MouseEvent) {
      if (leaving.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target || target.getAttribute("href")?.startsWith("#") || target.target === "_blank" || target.hasAttribute("download")) return;
      event.preventDefault();
      event.stopPropagation();
      setPending({ proceed: () => target.click() });
    }
    function signOut(event: SubmitEvent) {
      if (leaving.current) return;
      const form = event.target;
      if (form instanceof HTMLFormElement && !form.querySelector('input:not([type="hidden"]), textarea')) {
        event.preventDefault();
        event.stopPropagation();
        setPending({ proceed: () => form.requestSubmit() });
      }
    }
    const navigation = "navigation" in window ? window.navigation as Navigation : undefined;
    function traverse(event: Event) {
      if (leaving.current || !event.cancelable || !("navigationType" in event) || event.navigationType !== "traverse") return;
      const destination = "destination" in event ? event.destination as { key?: string } : undefined;
      if (!destination?.key || !navigation) return;
      event.preventDefault();
      const key = destination.key;
      setPending({ proceed: () => navigation.traverseTo(key) });
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    document.addEventListener("submit", signOut, true);
    navigation?.addEventListener("navigate", traverse);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", signOut, true);
      navigation?.removeEventListener("navigate", traverse);
    };
  }, [dirty]);
  return pending ? <dialog ref={dialog} className="discard-dialog" aria-labelledby="discard-title" aria-describedby="discard-description" onCancel={() => setPending(null)}>
    <h2 id="discard-title">Discard unsaved changes?</h2>
    <p id="discard-description">Your edits have not been saved. Keep editing to preserve them, or discard them to leave.</p>
    <div className="flex flex-wrap gap-3">
      <button type="button" className="secondary" autoFocus onClick={() => setPending(null)}>Keep editing</button>
      <button type="button" className="bg-slate-900 px-4 py-2" onClick={() => {
        leaving.current = true;
        setPending(null);
        pending.proceed();
      }}>Discard changes</button>
    </div>
  </dialog> : null;
}
