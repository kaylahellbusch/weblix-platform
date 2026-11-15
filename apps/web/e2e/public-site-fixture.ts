import { expect, type Browser, type Page } from '@playwright/test';
import { base, createBusiness, saveContent } from './preview-fixture';

export async function publicFixture(browser: Browser) {
  if (!process.env.WEBLIX_STORAGE_STATE) throw new Error('Owner fixture requires WEBLIX_STORAGE_STATE');
  const owner = await browser.newContext({ storageState: process.env.WEBLIX_STORAGE_STATE });
  const page = await owner.newPage();
  const slug = `roof-${crypto.randomUUID().slice(0, 8)}`;
  const name = `Public Roofing ${slug}`;
  const path = await createBusiness(page, name);
  await saveContent(page, path, `Published headline ${slug}`);
  async function publish(value: boolean) {
    await page.goto(`${base()}${path}/edit`);
    await page.getByLabel('Subdomain', { exact: true }).fill(slug);
    await page.getByRole('switch', { name: 'Published', exact: true }).setChecked(value);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await page.waitForURL(`${base()}${path}`);
  }
  const url = new URL(base());
  url.hostname = `${slug}.localhost`;
  await publish(true);
  return { owner, page, path, slug, name, url: url.toString(), publish };
}

export async function expectMissing(page: Page, url: string, name: string) {
  const response = await page.goto(url);
  expect(response?.status()).toBe(404);
  await expect(page.getByText('This page could not be found.')).toBeVisible();
  expect(await page.content()).not.toContain(name);
}
