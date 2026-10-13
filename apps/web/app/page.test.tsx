import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the Weblix platform landing content", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /weblix platform/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/built for business data \+ website generation/i),
    ).toBeInTheDocument();
  });
});
