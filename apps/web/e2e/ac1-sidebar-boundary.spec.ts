import { test, expect } from '@playwright/test';

test.use({ storageState: process.env.WEBLIX_STORAGE_STATE });
// The workspace sidebar is intentionally hidden below 700px (AC4).
for (const width of [1280]) {
  test(`AC1: selected sidebar has a complete dark border at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL}/admin`);
    const selected = page.locator('.workspace-nav a[aria-current]');
    await expect(selected).toBeVisible();
    expect(await selected.evaluate(el => {
      const css = getComputedStyle(el);
      return ['Top', 'Right', 'Bottom', 'Left'].map(side => [
        css.getPropertyValue(`border-${side.toLowerCase()}-width`),
        css.getPropertyValue(`border-${side.toLowerCase()}-style`),
        css.getPropertyValue(`border-${side.toLowerCase()}-color`),
      ]);
    })).toEqual(Array(4).fill(['2px', 'solid', 'rgb(32, 39, 52)']));
    // Exercise the unselected styling even though the workspace has only one link.
    await selected.evaluate(el => el.removeAttribute("aria-current"));
    for (const link of await page.locator('.workspace-nav a:not([aria-current])').all()) {
      await expect(link).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)');
    }
  });
}
