import path from 'node:path';
import { test, expect } from '@playwright/test';
import { base, createBusiness } from './preview-fixture';
import { publicFixture } from './public-site-fixture';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
for (const width of [375, 1280]) {
  for (const publicSite of [false, true]) {
    test(`AC1: neutral contact wording on ${publicSite ? 'public site' : 'preview'} at ${width}px`, async ({ page, browser }, info) => {
      test.setTimeout(90000);
      const fixture = publicSite ? await publicFixture(browser) : undefined;
      try {
        await page.setViewportSize({ width, height: 1000 });
        const url = fixture?.url ?? `${base()}${await createBusiness(page)}/preview`;
        await page.goto(url);
        const article = page.getByRole('article', { name: publicSite ? 'Business website' : 'Website preview', exact: true });
        await expect(article).toBeVisible();
        await page.screenshot({ path: process.env.PLAYWRIGHT_SCREENSHOT_DIR
          ? path.join(process.env.PLAYWRIGHT_SCREENSHOT_DIR, `neutral-${publicSite ? 'public' : 'preview'}-${width}.png`)
          : info.outputPath('contact-wording.png'), fullPage: true });
        await expect(article).not.toContainText(/free|estimate|guarantee|warranty|insured|licensed/i);
        await expect(article.getByRole('link', { name: 'Contact us', exact: true })).toHaveAttribute('href', '#contact');
        await expect(article.getByRole('button', { name: 'Contact us', exact: true })).toBeDisabled();
      } finally {
        await fixture?.owner.close();
      }
    });
  }
}
