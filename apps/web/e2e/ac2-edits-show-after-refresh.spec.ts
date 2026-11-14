import { test, expect } from '@playwright/test';
import { base, createBusiness, saveContent } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
test('AC2: refreshed preview reflects changes to business and content', async ({ page }) => {
  const path = await createBusiness(page);
  await saveContent(page, path, 'First headline', false);
  await page.goto(`${base()}${path}/preview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('First headline');
  await page.goto(`${base()}${path}/edit`);
  await page.getByLabel('Business name', { exact: true }).fill('Updated Roofing');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await page.waitForURL(`${base()}${path}`);
  await saveContent(page, path, 'Updated headline', false);
  await page.goto(`${base()}${path}/preview`);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Updated headline');
  await expect(page.getByText('Updated', { exact: true }).first()).toBeVisible();
});
