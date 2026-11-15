import { test, expect } from '@playwright/test';
import { publicFixture, expectMissing } from './public-site-fixture';

test('AC4: unpublishing is effective on the next anonymous request', async ({ browser, page }) => {
  test.setTimeout(90000);
  const fixture = await publicFixture(browser);
  try {
    await page.goto(fixture.url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Published headline ${fixture.slug}`);
    await fixture.publish(false);
    await expectMissing(page, fixture.url, fixture.name);
    await fixture.publish(true);
    await page.goto(fixture.url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Published headline ${fixture.slug}`);
  } finally { await fixture.owner.close(); }
});
