"use client";
import { useEffect } from "react";

/** Protect workspace links, sign-out, and leaving the document. */
export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const message = "Discard unsaved changes? Your edits have not been saved.";
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); }
    function click(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!target || target.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm(message)) { event.preventDefault(); event.stopPropagation(); }
    }
    function signOut(event: SubmitEvent) {
      const form = event.target;
      if (form instanceof HTMLFormElement && !form.querySelector("input, textarea") && !window.confirm(message)) {
        event.preventDefault(); event.stopPropagation();
      }
    }
    function traverse(event: Event) {
      if ("navigationType" in event && event.navigationType === "traverse" && event.cancelable && !window.confirm(message)) event.preventDefault();
    }
    const navigation = "navigation" in window ? window.navigation as EventTarget : undefined;
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
}
