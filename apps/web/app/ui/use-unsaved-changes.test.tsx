import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useUnsavedChanges } from "./use-unsaved-changes";
function Editor({ dirty }: { dirty: boolean }) { useUnsavedChanges(dirty); return <a href="/admin" onClick={event => event.preventDefault()}>Leave</a>; }
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it("cancels navigation when edits are retained and removes the guard when clean", () => {
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const { rerender } = render(<Editor dirty />);
  const click = new MouseEvent("click", { bubbles: true, cancelable: true });
  screen.getByText("Leave").dispatchEvent(click);
  expect(click.defaultPrevented).toBe(true);
  expect(confirm).toHaveBeenCalledOnce();
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(true);
  rerender(<Editor dirty={false} />);
  fireEvent.click(screen.getByText("Leave"));
  expect(confirm).toHaveBeenCalledOnce();
});
