import { test, expect } from '@playwright/test';
import { publicFixture, expectMissing } from './public-site-fixture';

test('AC5: anonymous HTML contains preview facts without private identifiers or unpublished content', async ({ browser, page }) => {
  test.setTimeout(90000);
  const fixture = await publicFixture(browser);
  try {
    await page.goto(fixture.url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Published headline ${fixture.slug}`);
    await expect(page.getByText('hello@example.test', { exact: true }).first()).toBeVisible();
    const html = await page.content();
    for (const privateValue of [fixture.path.split('/').pop()!, 'owner_id', 'business_id', 'owner-one@example.test', 'owner-two@example.test']) {
      expect(html).not.toContain(privateValue);
    }
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    await fixture.publish(false);
    await expectMissing(page, fixture.url, fixture.name);
    expect(await page.content()).not.toContain(`Published headline ${fixture.slug}`);
  } finally { await fixture.owner.close(); }
});
