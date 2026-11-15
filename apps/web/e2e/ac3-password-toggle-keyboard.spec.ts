import { test, expect } from "@playwright/test";

test("AC3: Tab reaches toggle; Enter and Space toggle without submitting", async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.getByLabel("Email", { exact: true }).fill("synthetic@example.com");
  const input = page.getByLabel("Password", { exact: true });
  await input.fill("Synthetic-password-70");
  let submissions = 0;
  page.on("request", request => { if (request.method() === "POST") submissions++; });
  await input.press("Tab");
  await expect(page.getByRole("button", { name: "Show password" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(input).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Hide password" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(input).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).press("Tab");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeFocused();
  expect(submissions).toBe(0);
  await expect(page).toHaveURL(/\/login$/);
});
