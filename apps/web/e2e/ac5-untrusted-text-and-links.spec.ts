import { test, expect } from '@playwright/test';
import { base, createBusiness, saveContent } from './preview-fixture';
test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
test('AC5: saved markup stays literal and contact links use safe schemes', async ({ page }) => {
  const path = await createBusiness(page);
  await saveContent(page, path, '<script>alert(1)</script>', false);
  let dialog = false;
  page.on('dialog', async d => { dialog = true; await d.dismiss(); });
  await page.goto(`${base()}${path}/preview`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('<script>alert(1)</script>');
  expect(dialog).toBe(false);
  const hrefs = await page.locator('.granite-preview a').evaluateAll(links => links.map(a => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) expect(href).toMatch(/^(#contact|tel:|mailto:|https?:)/);
  await expect(page.getByRole('button', { name: 'Get My Free Estimate' })).toBeDisabled();
});
