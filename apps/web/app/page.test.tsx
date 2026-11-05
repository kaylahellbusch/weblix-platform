import { render, screen, within } from "@testing-library/react";
import Home from "./page";

it("provides a public product introduction with working entry and section links", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Client workspace for local sites");
  for (const link of screen.getAllByRole("link", { name: "Log in" })) expect(link).toHaveAttribute("href", "/login");
  const main = screen.getByRole("main");
  expect(within(main).getAllByRole("link", { name: "See the workspace" })[0]).toHaveAttribute("href", "#workspace-examples");
  expect(document.getElementById("workspace-examples")).toBeInTheDocument();
  expect(document.getElementById("how-it-works")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/kaylahellbusch/weblix-platform");
  expect(screen.queryByRole("link", { name: /try demo|get started|sign up/i })).not.toBeInTheDocument();
  expect(screen.getByText(/Website rendering, live preview, and publishing are not available yet/)).toBeInTheDocument();
  expect(screen.getAllByRole("img", { name: /Fictional workspace illustration/ })).toHaveLength(3);
});
