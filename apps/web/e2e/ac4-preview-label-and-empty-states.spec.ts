import { test, expect } from '@playwright/test';
import { base, createBusiness } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
test('AC4: empty preview is labelled and read-only without invented sections', async ({ page }) => {
  const path = await createBusiness(page);
  await page.goto(`${base()}${path}/preview`);
  await expect(page.getByText('Website preview · Read-only · Not published')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Summit Roofing');
  await expect(page.locator('#services, #locations, #testimonials')).toHaveCount(0);
  await expect(page.locator('a[href="#services"], a[href="#locations"], a[href="#testimonials"], a[href=""]')).toHaveCount(0);
  for (const field of await page.locator('.granite-preview').locator('input, textarea, button').all()) await expect(field).toBeDisabled();
  await expect(page.getByText(/Demo only/)).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
});
