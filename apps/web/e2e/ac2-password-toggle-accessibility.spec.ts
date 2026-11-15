import { test, expect } from "@playwright/test";

test("AC2: toggle announces its action and pressed state", async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/login`);
  const show = page.getByRole("button", { name: "Show password", exact: true });
  await expect(show).toHaveAttribute("aria-pressed", "false");
  await show.click();
  const hide = page.getByRole("button", { name: "Hide password", exact: true });
  await expect(hide).toHaveAttribute("aria-pressed", "true");
  await hide.click();
  await expect(show).toHaveAttribute("aria-pressed", "false");
});
