import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useUnsavedChanges } from "./use-unsaved-changes";
function Editor({ dirty }: { dirty: boolean }) {
  const dialog = useUnsavedChanges(dirty);
  return <>{dialog}<a href="/admin" onClick={event => event.preventDefault()}>Leave</a></>;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it("retains edits on cancel, allows explicit discard, and removes protection when clean", async () => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
  const { rerender } = render(<Editor dirty />);
  fireEvent.click(screen.getByText("Leave"));
  expect(screen.getByRole("dialog")).toHaveTextContent("Discard unsaved changes?");
  fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const unload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(true);
  fireEvent.click(screen.getByText("Leave"));
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  rerender(<Editor dirty={false} />);
  fireEvent.click(screen.getByText("Leave"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
