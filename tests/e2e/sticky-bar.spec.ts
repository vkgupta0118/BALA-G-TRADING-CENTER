import { expect, test } from 'playwright/test';
import { TEST_MAPS_URL, TEST_PHONE_E164, TEST_WHATSAPP_E164 } from '../../playwright.config';

test.describe('Mobile sticky conversion bar', () => {
  test('is fixed to the bottom with Call · WhatsApp · Directions and 44px+ targets', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/');
    const bar = page.getByTestId('sticky-bar');
    await expect(bar).toBeVisible();

    const viewport = page.viewportSize();
    const box = await bar.boundingBox();
    expect(box).toBeTruthy();
    expect(Math.round((box?.y ?? 0) + (box?.height ?? 0))).toBe(viewport?.height);
    expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');

    const call = page.getByTestId('sticky-call');
    const wa = page.getByTestId('sticky-whatsapp');
    const dir = page.getByTestId('sticky-directions');
    await expect(call).toHaveAttribute('href', `tel:+${TEST_PHONE_E164}`);
    await expect(wa).toHaveAttribute(
      'href',
      new RegExp(`^https://wa\\.me/${TEST_WHATSAPP_E164}\\?text=`),
    );
    await expect(dir).toHaveAttribute('href', TEST_MAPS_URL);

    for (const target of [call, wa, dir]) {
      const b = await target.boundingBox();
      expect(b?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(b?.width ?? 0).toBeGreaterThanOrEqual(44);
    }

    // Stays pinned after scrolling and never covers the footer's last content
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(bar).toBeInViewport();
    const bodyPadding = await page.evaluate(() =>
      Number.parseFloat(getComputedStyle(document.body).paddingBottom),
    );
    expect(bodyPadding).toBeGreaterThanOrEqual(box?.height ?? 0);
  });

  test('is present on every page on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    for (const path of ['/products', '/quote', '/contact']) {
      await page.goto(path);
      await expect(page.getByTestId('sticky-bar')).toBeVisible();
      await expect(page.getByTestId('sticky-whatsapp')).toBeVisible();
    }
  });

  test('is hidden on desktop where the header CTA is visible', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop only');
    await page.goto('/');
    await expect(page.getByTestId('sticky-bar')).toBeHidden();
    await expect(page.locator('.header-cta')).toBeVisible();
  });
});
