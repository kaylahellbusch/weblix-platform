import path from 'node:path';
import { test, expect } from '@playwright/test';
import { base, createBusiness } from './preview-fixture';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  test(`AC2: owner edits subdomain and publishing atomically at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    page.on("dialog", (dialog) => dialog.accept());
    await page.setViewportSize({ width, height: 1100 });
    const business = await createBusiness(page, 'Publishing Example Roofing');
    await page.goto(`${base()}${business}/edit`);
    await page.screenshot({ path: process.env.PLAYWRIGHT_SCREENSHOT_DIR
      ? path.join(process.env.PLAYWRIGHT_SCREENSHOT_DIR, `business-publishing-${width}.png`)
      : testInfo.outputPath(`business-publishing-${width}.png`), fullPage: true });
    const subdomain = page.getByLabel('Subdomain', { exact: true });
    const published = page.getByRole('switch', { name: 'Published', exact: true });
    await expect(subdomain).toHaveValue('');
    await expect(published).not.toBeChecked();
    const slug = `roof-${crypto.randomUUID().slice(0, 8)}`;
    await subdomain.fill(slug);
    await published.check();
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL(`${base()}${business}`);
    await page.goto(`${base()}${business}/edit`);
    await expect(subdomain).toHaveValue(slug);
    await expect(published).toBeChecked();
    await published.uncheck();
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL(`${base()}${business}`);
    await page.goto(`${base()}${business}/edit`);
    await expect(published).not.toBeChecked();
    for (const invalid of ['Bad--name', 'www', '']) {
      await subdomain.fill(invalid);
      await published.check();
      await page.getByLabel('Business name', { exact: true }).fill('Must not save');
      await page.getByRole('button', { name: 'Save changes', exact: true }).click();
      await expect(subdomain).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#business-form').getByRole('alert')).toBeVisible();
      await page.reload();
      await expect(subdomain).toHaveValue(slug);
      await expect(published).not.toBeChecked();
      await expect(page.getByLabel('Business name', { exact: true })).toHaveValue('Publishing Example Roofing');
    }
    const second = await createBusiness(page, 'Second Publishing Example');
    await page.goto(`${base()}${second}/edit`);
    await subdomain.fill(slug);
    await published.check();
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(page.getByText('This subdomain is already in use. Choose another one.')).toBeVisible();
    await page.reload();
    await expect(subdomain).toHaveValue('');
    await expect(published).not.toBeChecked();
    await subdomain.fill(`${slug}-two`);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL(`${base()}${second}`);
    await page.goto(`${base()}${second}/edit`);
    await expect(subdomain).toHaveValue(`${slug}-two`);
  });
}
