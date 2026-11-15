import path from "node:path";
import { test, expect } from "@playwright/test";

for (const width of [375, 1280]) {
  test(`AC4: toggle fits input and has a focus ring at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${process.env.BASE_URL}/login`);
    const input = page.getByLabel("Password", { exact: true });
    await input.fill("Synthetic-password-70-with-long-text");
    await input.press("Tab");
    const button = page.getByRole("button", { name: "Show password" });
    await expect(button).toBeFocused();
    const inputBox = (await input.boundingBox())!;
    const buttonBox = (await button.boundingBox())!;
    expect(buttonBox.x).toBeGreaterThan(inputBox.x);
    expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(inputBox.x + inputBox.width);
    expect(buttonBox.y).toBeGreaterThanOrEqual(inputBox.y);
    expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(inputBox.y + inputBox.height);
    const padding = await input.evaluate(el => parseFloat(getComputedStyle(el).paddingRight));
    expect(inputBox.x + inputBox.width - padding).toBeLessThanOrEqual(buttonBox.x);
    const ring = await button.evaluate(el => {
      const style = getComputedStyle(el);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    expect(ring.color).not.toBe("rgba(0, 0, 0, 0)");
    const screenshotPath = (name: string) => process.env.PLAYWRIGHT_SCREENSHOT_DIR
      ? path.join(process.env.PLAYWRIGHT_SCREENSHOT_DIR, name)
      : testInfo.outputPath(name);
    await page.screenshot({ path: screenshotPath(`login-hidden-${width}.png`) });
    await button.press("Enter");
    await expect(input).toHaveAttribute("type", "text");
    await page.screenshot({ path: screenshotPath(`login-visible-${width}.png`) });
  });
}
