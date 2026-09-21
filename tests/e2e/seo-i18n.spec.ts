import { expect, test } from 'playwright/test';
import { TEST_SITE_URL } from '../../playwright.config';

test.describe('SEO & pre-rendering', () => {
  test('each route ships real HTML with title, description, canonical and JSON-LD', async ({
    request,
  }) => {
    const routes: Array<[string, RegExp]> = [
      ['/', /Cement, Bricks & TMT Rods in Siliguri/],
      ['/products', /Cement, Bricks, TMT Rods & Hardware in Siliguri/],
      ['/quote', /Get a Building Materials Quote on WhatsApp/],
      ['/contact', /Contact M\/S Balajee Trading Centre/],
    ];
    for (const [path, title] of routes) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = (await res.text()).replaceAll('&amp;', '&');
      expect(html).toMatch(new RegExp(`<title>[^<]*${title.source}`));
      expect(html).toContain('<meta name="description"');
      expect(html).toContain(
        `<link rel="canonical" href="${TEST_SITE_URL}${path === '/' ? '/' : path}">`,
      );
      expect(html).toContain('"@type":["LocalBusiness","HardwareStore"]');
      expect(html).toContain('property="og:image"');
      // Pre-rendered content (not an empty SPA shell)
      expect(html).toContain('<h1');
      expect(html).toContain('Champasari');
    }
  });

  test('robots.txt, sitemap.xml, manifest and 404 behave like a static host', async ({
    request,
  }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain(`Sitemap: ${TEST_SITE_URL}/sitemap.xml`);

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    for (const p of ['/', '/products', '/quote', '/contact']) {
      expect(xml).toContain(`<loc>${TEST_SITE_URL}${p}</loc>`);
    }
    expect(xml).not.toContain('/404');

    expect((await request.get('/site.webmanifest')).status()).toBe(200);
    expect((await request.get('/favicon.svg')).status()).toBe(200);
    const missing = await request.get('/does-not-exist');
    expect(missing.status()).toBe(404);
    expect(await missing.text()).toContain('Page not found');
  });

  test('no false claims appear anywhere on the site', async ({ page }) => {
    const banned = [/lowest price/i, /#1\b/, /same[- ]day delivery/i, /authori[sz]ed dealer/i];
    for (const path of ['/', '/products', '/quote', '/contact']) {
      await page.goto(path);
      const text = await page.locator('body').innerText();
      for (const re of banned) expect(text).not.toMatch(re);
    }
  });

  test('owner-confirmed facts are stated, unconfirmed ones stay hidden', async ({ page }) => {
    await page.goto('/');
    // Confirmed on 2026-09-21: hours, delivery and the brands from the visiting card.
    await expect(page.getByTestId('hours-badge')).toBeVisible();
    await expect(page.getByTestId('hours-badge')).toContainText('8 am');
    await expect(page.getByTestId('hours-unverified')).toHaveCount(0);
    await expect(page.getByTestId('brands-section')).toBeVisible();
    await expect(page.getByTestId('delivery-copy')).toContainText('We deliver');
    // Still genuinely unverified: nobody has left a testimonial we have permission to use.
    await expect(page.getByTestId('reviews-empty')).toBeVisible();
  });

  test('opening hours reach structured data for every day of the week', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('"openingHoursSpecification"');
    expect(html).toContain('"opens":"08:00"');
    expect(html).toContain('"closes":"18:00"');
    for (const day of ['Monday', 'Saturday', 'Sunday']) expect(html).toContain(`"${day}"`);
    // HardwareStore is declared alongside LocalBusiness so generic consumers match it.
    expect(html).toContain('"@type":["LocalBusiness","HardwareStore"]');
  });

  test('Puja Samagri is claimed once, exactly as the owner approved', async ({ page }) => {
    await page.goto('/');
    const note = page.getByTestId('puja-note');
    await expect(note).toBeVisible();
    await expect(note).toHaveText(
      'Vikash Store — Puja Samagri available at M/S Balajee Trading Centre.',
    );
    // No invented items, kits, festivals-with-prices or availability promises.
    const body = await page.locator('body').innerText();
    for (const invented of [/puja kit/i, /festival offer/i, /always in stock/i]) {
      expect(body).not.toMatch(invented);
    }
  });
});

test.describe('English / Bengali', () => {
  test('switching to Bengali translates core conversion text and persists', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/');
    if (isMobile) await page.getByTestId('lang-toggle').click();
    else await page.getByTestId('lang-bn').click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('সিমেন্ট');
    await expect(page.getByTestId('hero-quote-cta')).toContainText('আজকের দাম নিন');
    if (isMobile) await expect(page.getByTestId('sticky-whatsapp')).toContainText('হোয়াটসঅ্যাপে দাম');

    // WhatsApp message is generated in Bengali too
    const href = (await page.getByTestId('whatsapp-link').first().getAttribute('href')) ?? '';
    expect(decodeURIComponent(href)).toContain('নমস্কার');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('সিমেন্ট');
  });
});
