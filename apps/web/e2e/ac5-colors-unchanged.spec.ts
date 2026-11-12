import { test, expect } from '@playwright/test';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  test(`AC5: selected controls retain apricot background and dark text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL}/admin`);
    const sidebar = page.locator('.workspace-nav a[aria-current]');
    await expect(sidebar).toHaveCSS('background-color', 'rgb(233, 152, 85)');
    await expect(sidebar).toHaveCSS('color', 'rgb(32, 39, 52)');
    for (const name of ['Grid', 'Compact']) {
      const button = page.getByRole('button', { name, exact: true });
      await button.click();
      await expect(button).toHaveCSS('background-color', 'rgb(233, 152, 85)');
      await expect(button).toHaveCSS('color', 'rgb(32, 39, 52)');
    }
  });
}
