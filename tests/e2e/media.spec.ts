import { expect, test } from 'playwright/test';

/**
 * The CSS-3D hero was replaced with the shop's own photographs. These tests hold
 * the line on the two things that regress first when photos enter a page:
 * layout shift, and the sticky bar covering something you need to tap.
 */
test.describe('Photographs', () => {
  test('the decorative 3D scene is gone from every page', async ({ page }) => {
    for (const path of ['/', '/products', '/quote', '/contact']) {
      await page.goto(path);
      await expect(page.locator('.scene')).toHaveCount(0);
      await expect(page.getByTestId('materials-scene')).toHaveCount(0);
      await expect(page.getByTestId('scene-fallback')).toHaveCount(0);
    }
  });

  test('the hero is a real photograph, eager and high priority', async ({ page }) => {
    await page.goto('/');
    const img = page.locator('[data-testid="hero-media"] img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('loading', 'eager');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    // Alt text describes what is in the frame, not "hero image".
    const alt = (await img.getAttribute('alt')) ?? '';
    expect(alt.toLowerCase()).toContain('brick');
    expect(alt).toContain('Balajee Trading Centre');
    // AVIF and WebP are offered ahead of the JPEG fallback.
    const types = await page
      .locator('[data-testid="hero-media"] source')
      .evaluateAll((els) => els.map((el) => el.getAttribute('type')));
    expect(types).toEqual(['image/avif', 'image/webp']);
  });

  test('every image reserves its box, so nothing shifts while loading', async ({ page }) => {
    await page.goto('/');
    const imgs = page.locator('picture img');
    const count = await imgs.count();
    expect(count).toBeGreaterThan(1);
    for (let i = 0; i < count; i += 1) {
      const img = imgs.nth(i);
      expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
      expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
      await expect(img).toHaveAttribute('style', /aspect-ratio/);
    }
  });

  test('images below the hero are lazy', async ({ page }) => {
    await page.goto('/');
    const lazy = await page.locator('picture img[loading="lazy"]').count();
    expect(lazy).toBeGreaterThan(0);
    // exactly one eager image on the page: the hero
    expect(await page.locator('picture img[loading="eager"]').count()).toBe(1);
  });

  test('categories without a photograph say so instead of borrowing one', async ({ page }) => {
    await page.goto('/products');
    const pending = page.getByTestId('photo-pending');
    expect(await pending.count()).toBeGreaterThan(0);
    await expect(pending.first()).toHaveAttribute('aria-label', /coming soon/i);
  });
});

test.describe('Mobile sticky bar never covers a control', () => {
  test('hero buttons and the sticky bar do not overlap at 375px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const bar = await page.getByTestId('sticky-bar').boundingBox();
    expect(bar).toBeTruthy();
    const barTop = bar?.y ?? 0;

    for (const testid of ['hero-quote-cta', 'call-link']) {
      const el = page.getByTestId(testid).first();
      await el.scrollIntoViewIfNeeded();
      const box = await el.boundingBox();
      expect(box, `${testid} has no box`).toBeTruthy();
      const bottom = (box?.y ?? 0) + (box?.height ?? 0);
      expect(bottom, `${testid} is covered by the sticky bar`).toBeLessThanOrEqual(barTop);
    }
  });

  test('the quote submit button clears the sticky bar at 375px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/quote?add=cement');
    const submit = page.getByTestId('submit-quote');
    await submit.scrollIntoViewIfNeeded();
    const box = await submit.boundingBox();
    const bar = await page.getByTestId('sticky-bar').boundingBox();
    const bottom = (box?.y ?? 0) + (box?.height ?? 0);
    expect(bottom).toBeLessThanOrEqual(bar?.y ?? 0);
    // and it is still a comfortable target
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('every sticky-bar target is at least 44px at 375px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    for (const id of ['sticky-call', 'sticky-whatsapp', 'sticky-directions']) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box?.height ?? 0, id).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0, id).toBeGreaterThanOrEqual(44);
    }
  });
});
