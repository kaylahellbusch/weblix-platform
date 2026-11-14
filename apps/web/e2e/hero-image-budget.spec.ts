import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { base, createBusiness, saveContent } from './preview-fixture';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE, deviceScaleFactor: 1 });
for (const width of [375, 1280]) {
  test(`hero first-load image budget at ${width}px (DPR 1)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const path = await createBusiness(page);
    await saveContent(page, path);
    const responses: Promise<{ url: string; bytes: number; type: string }>[] = [];
    page.on('response', response => {
      if (decodeURIComponent(response.url()).includes('/images/granite/new-roof-3.')) {
        responses.push((async () => ({ url: response.url(), bytes: (await response.body()).length,
          type: response.headers()['content-type'] ?? '' }))());
      }
    });
    await page.goto(`${base()}${path}/preview`, { waitUntil: 'networkidle' });
    const images = await Promise.all(responses);
    const timing = await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(entry => decodeURIComponent(entry.name).includes('/images/granite/new-roof-3.'))
      .map(entry => { const r = entry as PerformanceResourceTiming; return {
        url: r.name, encodedBodySize: r.encodedBodySize, transferSize: r.transferSize,
      }; }));
    const result = { width, dpr: 1, images, imageBytes: images.reduce((sum, image) => sum + image.bytes, 0), timing };
    const artifact = test.info().outputPath('hero-network.json');
    writeFileSync(artifact, JSON.stringify(result, null, 2));
    await test.info().attach('hero-network', { path: artifact, contentType: 'application/json' });
    expect(images).toHaveLength(1);
    expect(result.imageBytes).toBeLessThan(250_000);
    expect(new URL(images[0].url).pathname).toBe('/_next/image');
    expect(Number(new URL(images[0].url).searchParams.get('w'))).toBeLessThanOrEqual(width === 375 ? 750 : 2400);
    expect(new URL(images[0].url).searchParams.get('url')).toBe('/images/granite/new-roof-3.webp');
    const hero = page.locator('section[aria-labelledby="preview-headline"] img');
    await expect(hero).toHaveAttribute('sizes', '100vw');
    await expect(hero).toHaveCSS('object-fit', 'cover');
    await expect(hero).toHaveCSS('object-position', '50% 100%');
  });
}
