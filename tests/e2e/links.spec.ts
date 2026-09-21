import { expect, test } from 'playwright/test';
import { TEST_MAPS_URL, TEST_PHONE_E164, TEST_WHATSAPP_E164 } from '../../playwright.config';
import { blockNavigation, captureOpenedWhatsApp, decodeWaText, trackedEvents } from './helpers';

test.describe('Conversion links', () => {
  test('every WhatsApp CTA is a valid wa.me link using only the configured number', async ({
    page,
  }) => {
    await page.goto('/');
    const links = page.getByTestId('whatsapp-link');
    const count = await links.count();
    expect(count).toBeGreaterThan(2);
    for (let i = 0; i < count; i += 1) {
      const href = (await links.nth(i).getAttribute('href')) ?? '';
      expect(href).toMatch(new RegExp(`^https://wa\\.me/${TEST_WHATSAPP_E164}\\?text=.+`));
      await expect(links.nth(i)).toHaveAttribute('target', '_blank');
      await expect(links.nth(i)).toHaveAttribute('rel', /noopener/);
      const { text } = decodeWaText(href);
      expect(text).toContain('M/S Balajee Trading Centre');
    }
    // No other phone number leaks into any WhatsApp link on the page
    const allHrefs = await page
      .locator('a[href^="https://wa.me/"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));
    for (const h of allHrefs) expect(h).toContain(`wa.me/${TEST_WHATSAPP_E164}?`);
    // Unconfigured placeholder never renders when a number IS configured
    await expect(page.getByTestId('whatsapp-unconfigured')).toHaveCount(0);
  });

  test('product "Request today’s price" links name the product', async ({ page }) => {
    await page.goto('/products');
    const cementCard = page.locator('#cement');
    const href = (await cementCard.getByTestId('whatsapp-link').getAttribute('href')) ?? '';
    expect(decodeWaText(href).text).toContain('price for Cement');
  });

  test('call links use tel: with the configured E.164 number and track call_click', async ({
    page,
  }) => {
    await page.goto('/contact');
    const call = page.getByTestId('call-link').first();
    await expect(call).toHaveAttribute('href', `tel:+${TEST_PHONE_E164}`);
    await blockNavigation(page);
    await call.click();
    const events = await trackedEvents(page);
    expect(events.some((e) => e.name === 'call_click')).toBe(true);
  });

  test('directions links open Google Maps in a new tab and track directions_click', async ({
    page,
  }) => {
    await page.goto('/');
    const dir = page.getByTestId('directions-link').first();
    await expect(dir).toHaveAttribute('href', TEST_MAPS_URL);
    await expect(dir).toHaveAttribute('target', '_blank');
    await expect(dir).toHaveAttribute('rel', /noopener/);
    await blockNavigation(page);
    await dir.click();
    const events = await trackedEvents(page);
    const ev = events.find((e) => e.name === 'directions_click');
    expect(ev).toBeTruthy();
    expect(ev?.params.page_path).toBe('/');
  });

  test('WhatsApp click is tracked with its source and no personal data', async ({ page }) => {
    await page.goto('/');
    await blockNavigation(page);
    await page.getByTestId('whatsapp-link').filter({ visible: true }).first().click();
    const events = await trackedEvents(page);
    const ev = events.find((e) => e.name === 'whatsapp_click');
    expect(ev).toBeTruthy();
    expect(typeof ev?.params.source).toBe('string');
    expect(Object.keys(ev?.params ?? {})).not.toContain('phone');
  });

  test('contact form routes the enquiry to WhatsApp instead of pretending to store it', async ({
    page,
    context,
  }) => {
    await page.goto('/contact');
    await expect(page.getByTestId('contact-form')).toContainText('does not store anything');
    await page.getByTestId('contact-submit').click();
    await expect(page.getByTestId('contact-message')).toHaveAttribute('aria-invalid', 'true');

    await page.getByTestId('contact-message').fill('Do you have 16 mm TMT in stock this week?');
    const url = await captureOpenedWhatsApp(context, () =>
      page.getByTestId('contact-submit').click(),
    );
    const { number, text } = decodeWaText(url);
    expect(number).toBe(TEST_WHATSAPP_E164);
    expect(text).toContain('Do you have 16 mm TMT in stock this week?');
  });
});
