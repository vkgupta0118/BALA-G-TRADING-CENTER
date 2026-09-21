import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'playwright/test';

const WIDTHS = [375, 768, 1024, 1440] as const;
const PAGES: Array<{ slug: string; path: string }> = [
  { slug: 'home', path: '/' },
  { slug: 'products', path: '/products' },
  { slug: 'quote', path: '/quote' },
  { slug: 'contact', path: '/contact' },
];
const OUT = path.join(process.cwd(), 'screenshots');

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true });
});

for (const width of WIDTHS) {
  for (const p of PAGES) {
    test(`${p.slug} @ ${width}px renders without horizontal overflow`, async ({ page }) => {
      const height = width < 768 ? 812 : width < 1024 ? 1024 : 900;
      await page.setViewportSize({ width, height });
      await page.goto(p.path, { waitUntil: 'networkidle' });

      // Walk the page so scroll-reveal sections are shown, then return to top.
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 600));
      });

      // No horizontal scrolling at any breakpoint
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${p.path} @ ${width}`).toBeLessThanOrEqual(0);

      await page.screenshot({ path: path.join(OUT, `${p.slug}-${width}.png`), fullPage: true });
      await page.screenshot({
        path: path.join(OUT, `${p.slug}-${width}-viewport.png`),
        fullPage: false,
      });
    });
  }
}

test('quote builder filled state @ 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/quote?add=cement');
  await page.getByTestId('quantity-input').fill('50');
  await page.getByTestId('pick-tmt').click();
  await page.getByTestId('quote-line').nth(1).getByTestId('quantity-input').fill('500');
  await page.getByTestId('delivery-area').selectOption('Champasari');
  await page.getByTestId('name-input').fill('Rahul Das');
  await page.getByTestId('phone-input').fill('98765 43210');
  await page.screenshot({ path: path.join(OUT, 'quote-filled-375.png'), fullPage: true });
});

test('quote builder validation state @ 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/quote');
  await page.getByTestId('submit-quote').click();
  await expect(page.getByTestId('error-summary')).toBeFocused();
  await page.waitForTimeout(900); // let smooth scroll settle
  await page.screenshot({ path: path.join(OUT, 'quote-errors-1024.png'), fullPage: false });
});

test('bengali home @ 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByTestId('lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await page.waitForTimeout(500); // font swap
  await page.screenshot({ path: path.join(OUT, 'home-bn-375-viewport.png'), fullPage: false });
});

test('mobile menu open @ 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByTestId('menu-toggle').click();
  await expect(page.getByTestId('mobile-menu')).toBeVisible();
  await page.screenshot({ path: path.join(OUT, 'home-menu-375-viewport.png'), fullPage: false });
});
