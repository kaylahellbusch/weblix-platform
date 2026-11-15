import { test, expect } from "@playwright/test";

test("AC1: password starts hidden and toggles without losing its value", async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/login`);
  const input = page.getByLabel("Password", { exact: true });
  await expect(input).toHaveAttribute("type", "password");
  await input.fill("Synthetic-password-70");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toHaveValue("Synthetic-password-70");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(input).toHaveAttribute("type", "password");
  await expect(input).toHaveValue("Synthetic-password-70");
  await page.reload();
  await expect(input).toHaveAttribute("type", "password");
});
