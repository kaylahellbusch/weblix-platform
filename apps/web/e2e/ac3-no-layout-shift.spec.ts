import { test, expect } from '@playwright/test';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  test(`AC3: selection preserves control dimensions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL}/admin`);
    if (width === 1280) {
      await expect(page.locator('.workspace-nav a[aria-current]')).toBeVisible();
      const sidebar = page.locator('.workspace-nav a[aria-current]');
      const dimensions = () => sidebar.evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
      const selectedSize = await dimensions();
      // The workspace currently has one link; remove selection to compare the same control.
      await sidebar.evaluate(el => el.removeAttribute('aria-current'));
      expect(await page.locator('.workspace-nav a').evaluate(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))).toEqual(selectedSize);
    } else {
      await expect(page.locator('.workspace-nav a[aria-current]')).toBeHidden();
    }
    const buttons = page.locator('.view-switch button');
    const sizes = () => buttons.evaluateAll(els => els.map(el => {
      const { x, y, width, height } = el.getBoundingClientRect();
      return { x, y, width, height };
    }));
    await page.getByRole('button', { name: 'Grid', exact: true }).click();
    const grid = await sizes();
    await page.getByRole('button', { name: 'Compact', exact: true }).click();
    expect(await sizes()).toEqual(grid);
  });
}
