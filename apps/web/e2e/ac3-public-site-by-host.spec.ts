import path from 'node:path';
import { test, expect } from '@playwright/test';
import { publicFixture, expectMissing } from './public-site-fixture';

for (const width of [375, 1280]) {
  test(`AC3: anonymous host site and missing sites at ${width}px`, async ({ browser, page }, info) => {
    test.setTimeout(90000);
    const fixture = await publicFixture(browser);
    try {
      await page.setViewportSize({ width, height: 1000 });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(fixture.url);
      await page.waitForLoadState("networkidle");
      // Capture before asserting, so main supplies matching baseline evidence.
      await page.screenshot({ path: process.env.PLAYWRIGHT_SCREENSHOT_DIR
        ? path.join(process.env.PLAYWRIGHT_SCREENSHOT_DIR, `public-site-${width}.png`)
        : info.outputPath(`public-site-${width}.png`), fullPage: true });
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Published headline ${fixture.slug}`);
      await expect(page.getByText('Website preview · Read-only · Not published')).toHaveCount(0);
      expect(errors).toEqual([]);
      await expectMissing(page, fixture.url.replace(fixture.slug, 'unknown-roof'), fixture.name);
      await fixture.publish(false);
      await expectMissing(page, fixture.url, fixture.name);
    } finally { await fixture.owner.close(); }
  });
}
