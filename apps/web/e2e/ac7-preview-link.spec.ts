import { test, expect } from '@playwright/test';
import { base, createBusiness } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
test('AC7: Preview website opens from business details with the keyboard', async ({ page }) => {
  const path = await createBusiness(page);
  const link = page.getByRole('link', { name: 'Preview website', exact: true });
  await expect(link).toHaveAttribute('href', `${path}/preview`);
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${base()}${path}/preview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Summit Roofing');
});
