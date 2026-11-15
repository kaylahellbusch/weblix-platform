import { test, expect } from "@playwright/test";

test("AC5: both visibility states submit the typed password", async ({ page }) => {
  for (const visible of [false, true]) {
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByLabel("Email", { exact: true }).fill("synthetic@example.com");
    await page.getByLabel("Password", { exact: true }).fill("Synthetic-password-70");
    if (visible) await page.getByRole("button", { name: "Show password" }).click();
    // Observe FormData at the submit boundary without sending synthetic credentials.
    await page.locator("form").evaluate(form => {
      form.addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(form as HTMLFormElement);
        form.setAttribute("data-submitted-password", String(data.get("password")));
      }, { once: true });
    });
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("form")).toHaveAttribute("data-submitted-password", "Synthetic-password-70");
  }
});
