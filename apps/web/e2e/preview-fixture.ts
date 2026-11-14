import { expect, type Page } from '@playwright/test';

export const base = () => {
  if (!process.env.BASE_URL) throw new Error('BASE_URL is required');
  return process.env.BASE_URL;
};
export async function createBusiness(page: Page, name = 'Summit Roofing') {
  await page.goto(`${base()}/admin/businesses/new`);
  await page.getByLabel('Business name', { exact: true }).fill(name);
  await page.getByLabel('Industry', { exact: true }).fill('Roofing');
  await page.getByLabel('Phone', { exact: true }).fill('(208) 555-0100');
  await page.getByLabel('Email', { exact: true }).fill('hello@example.test');
  await page.getByLabel('Website', { exact: true }).fill('https://example.test');
  await page.getByLabel('City', { exact: true }).fill('Boise');
  await page.getByLabel('State', { exact: true }).fill('ID');
  await page.getByRole('button', { name: 'Create business', exact: true }).click();
  await page.waitForURL(/\/admin\/businesses\/[\da-f-]+$/);
  return new URL(page.url()).pathname;
}
export async function saveContent(page: Page, path: string, headline = 'Roofing for your home in Boise', full = true) {
  await page.goto(`${base()}${path}/content`);
  await page.getByLabel('Headline (up to 160 characters)', { exact: true }).fill(headline);
  if (full) {
    await page.locator('.introduction-panel summary').click();
    await page.getByLabel('Introduction (up to 2,000 characters)').fill('We help homeowners with roof repairs and replacements in the Treasure Valley.');
    for (const [i, [title, description]] of [
      ['Roof repair', 'Repair damaged shingles and leaks.'],
      ['Roof replacement', 'Replace worn roofing with a new roof.'],
      ['Roof inspection', 'Inspect the condition of your roof.'],
    ].entries()) {
      await page.getByRole('button', { name: 'Add service', exact: true }).click();
      await page.getByLabel(`Service ${i + 1} title (up to 120 characters)`, { exact: true }).fill(title);
      await page.getByLabel(`Service ${i + 1} description (up to 1,000 characters)`, { exact: true }).fill(description);
    }
    for (const [i, area] of ['Boise', 'Meridian', 'Eagle'].entries()) {
      await page.getByRole('button', { name: 'Add service area', exact: true }).click();
      await page.getByLabel(`Service area ${i + 1} (up to 120 characters)`, { exact: true }).fill(area);
    }
  }
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Website content saved.');
}
