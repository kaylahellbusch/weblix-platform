import { test, expect } from '@playwright/test';
import { base, createBusiness, saveContent } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  test(`AC6: Granite layout fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const path = await createBusiness(page);
    await saveContent(page, path);
    await page.goto(`${base()}${path}/preview`);
    const preview = page.getByRole('article', { name: 'Website preview' });
    await expect(preview).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const bounds = await preview.boundingBox();
    expect(bounds?.x).toBe(0);
    expect(bounds?.width).toBe(width);
    await expect(page.locator('#preview-headline')).toHaveCSS('font-size', width === 375 ? '36px' : '48px');
    await expect(page.locator('#services h3').first()).toBeVisible();
    await expect(page.locator('#locations')).toBeVisible();
  });
}
