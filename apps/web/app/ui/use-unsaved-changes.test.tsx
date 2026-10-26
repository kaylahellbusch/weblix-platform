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
it("preserves modified, auxiliary, new-tab and download link behavior while dirty", () => {
  function Draft() {
    const dialog = useUnsavedChanges(true);
    return <>{dialog}<a href="/admin" onClick={event => event.preventDefault()}>Browse</a><a href="/admin" target="_blank" onClick={event => event.preventDefault()}>New tab</a><a href="/sample.csv" download onClick={event => event.preventDefault()}>Download</a></>;
  }
  render(<Draft />);
  for (const options of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    fireEvent.click(screen.getByText("Browse"), options);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  }
  fireEvent.click(screen.getByText("New tab"));
  fireEvent.click(screen.getByText("Download"));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
it("allows history movement between content anchors without discarding the current draft", () => {
  const navigation = new EventTarget();
  Object.defineProperty(window, "navigation", { configurable: true, value: navigation });
  render(<Editor dirty />);
  const event = new Event("navigate", { cancelable: true });
  Object.defineProperties(event, { navigationType: { value: "traverse" }, destination: { value: { key: "section", url: window.location.href.split("#")[0] + "#services-section" } } });
  navigation.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  Reflect.deleteProperty(window, "navigation");
});
