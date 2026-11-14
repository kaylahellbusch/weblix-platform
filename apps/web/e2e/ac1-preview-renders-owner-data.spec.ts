import { test, expect } from '@playwright/test';
import { base, createBusiness, saveContent } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
test('AC1: stored business and saved content render in the preview', async ({ page }) => {
  const path = await createBusiness(page);
  await saveContent(page, path);
  await page.goto(`${base()}${path}/preview`);
  const preview = page.getByRole('article', { name: 'Website preview' });
  await expect(preview.getByRole('heading', { level: 1 })).toHaveText('Roofing for your home in Boise');
  await expect(preview.getByText('We help homeowners with roof repairs and replacements in the Treasure Valley.').first()).toBeVisible();
  await expect(preview.getByText('Repair damaged shingles and leaks.')).toBeVisible();
  await expect(preview.getByText('Meridian').first()).toBeVisible();
  await expect(preview.getByRole('link', { name: 'hello@example.test' }).first()).toBeVisible();
  await expect(preview.getByText('Summit', { exact: true }).first()).toBeVisible();
});
