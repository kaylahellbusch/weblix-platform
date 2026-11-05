import { fireEvent, render, screen } from "@testing-library/react";
import { MobileNavigation } from "./navigation";

it("closes the menu on Escape and returns focus to its trigger", () => {
  const { container } = render(<MobileNavigation />);
  const menu = container.querySelector("details")!;
  menu.open = true;
  fireEvent.keyDown(screen.getByRole("link", { name: "How it works" }), { key: "Escape" });
  expect(menu.open).toBe(false);
  expect(container.querySelector("summary")).toHaveFocus();
});

it("closes the menu after selecting an on-page destination", () => {
  const { container } = render(<MobileNavigation />);
  const menu = container.querySelector("details")!;
  menu.open = true;
  fireEvent.click(screen.getByRole("link", { name: "Workspace examples" }));
  expect(menu.open).toBe(false);
});
