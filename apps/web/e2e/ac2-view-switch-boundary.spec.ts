import { test, expect } from '@playwright/test';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  test(`AC2: only selected view has a dark outline at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL}/admin`);
    for (const name of ['Grid', 'Compact']) {
      const button = page.getByRole('button', { name, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(button).toHaveCSS('outline', 'rgb(32, 39, 52) solid 2px');
      await expect(page.locator('.view-switch button[aria-pressed="false"]')).toHaveCSS('outline-style', 'none');
      // Return using the keyboard to exercise :focus-visible on the selected control.
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(button).toBeFocused();
      await expect(button).toHaveCSS('outline', 'rgb(32, 39, 52) solid 2px');
      await expect(button).toHaveCSS('box-shadow', 'rgb(255, 255, 255) 0px 0px 0px 3px, rgb(53, 102, 214) 0px 0px 0px 6px');
    }
  });
}
