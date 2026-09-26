import { expect, test } from 'playwright/test';
import { TEST_WHATSAPP_E164 } from '../../playwright.config';
import { captureOpenedWhatsApp, decodeWaText, trackedEvents } from './helpers';

test.describe('Quote builder – validation', () => {
  test('blocks an empty submission and lists every problem', async ({ page }) => {
    await page.goto('/quote');
    await page.getByTestId('submit-quote').click();

    const summary = page.getByTestId('error-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.locator('li')).toHaveCount(4); // materials, area, name, phone

    await expect(page.getByTestId('delivery-area')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('name-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('phone-input')).toHaveAttribute('aria-invalid', 'true');
    // Nothing tracked as submitted, no WhatsApp opened
    const events = await trackedEvents(page);
    expect(events.some((e) => e.name === 'quote_submitted')).toBe(false);
  });

  test('validates quantity per material line and clears errors as the user fixes them', async ({
    page,
  }) => {
    await page.goto('/quote');
    await page.getByTestId('pick-cement').click();
    await expect(page.getByTestId('quote-line')).toHaveCount(1);
    await expect(page.getByTestId('quantity-input')).toBeFocused();

    await page.getByTestId('quantity-input').fill('0');
    await page.getByTestId('submit-quote').click();
    await expect(page.getByTestId('quantity-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Enter a quantity greater than 0.').first()).toBeVisible();

    await page.getByTestId('quantity-input').fill('25');
    await expect(page.getByTestId('quantity-input')).not.toHaveAttribute('aria-invalid', 'true');

    // Error summary links point at the invalid fields
    await expect(page.getByTestId('error-summary').locator('a[href="#name"]')).toBeVisible();
  });

  test('rejects an invalid phone number', async ({ page }) => {
    await page.goto('/quote?add=bricks');
    await expect(page.getByTestId('quote-line')).toHaveCount(1);
    await page.getByTestId('quantity-input').fill('2000');
    await page.getByTestId('delivery-area').selectOption('Matigara');
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('phone-input').fill('12345');
    await page.getByTestId('submit-quote').click();
    await expect(page.getByTestId('phone-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('error-summary').locator('li')).toHaveCount(1);
  });
});

test.describe('Quote builder – WhatsApp message', () => {
  test('opens WhatsApp with a complete, correctly encoded quotation', async ({ page, context }) => {
    await page.goto('/quote');

    await page.getByTestId('pick-cement').click();
    const lines = page.getByTestId('quote-line');
    await lines.nth(0).getByTestId('quantity-input').fill('50');
    await lines.nth(0).locator('input[data-field="spec"]').fill('OPC 53');

    await page.getByTestId('pick-tmt').click();
    await expect(lines).toHaveCount(2);
    await lines.nth(1).locator('input[data-field="spec"]').fill('12 mm');
    await lines.nth(1).getByTestId('quantity-input').fill('500');
    await lines.nth(1).locator('select[data-field="unit"]').selectOption('kg');

    await page.getByTestId('delivery-area').selectOption('__other__');
    await page.getByTestId('delivery-area-other').fill('Naxalbari');
    await page.getByTestId('name-input').fill('Rahul Das');
    await page.getByTestId('phone-input').fill('98765 43210');
    await page.getByTestId('notes-input').fill('Need by Saturday morning');

    // Live preview shows the message before sending
    const preview = page.getByTestId('message-preview');
    await expect(preview).toContainText('Cement (OPC 53): 50 bags');
    await expect(preview).toContainText('TMT Rods & Steel (12 mm): 500 kg');

    const href = await captureOpenedWhatsApp(context, () =>
      page.getByTestId('submit-quote').click(),
    );

    const { number, text } = decodeWaText(href);
    expect(href.startsWith(`https://wa.me/${TEST_WHATSAPP_E164}?text=`)).toBe(true);
    expect(number).toBe(TEST_WHATSAPP_E164);
    expect(text).toContain('Hello M/S Balajee Trading Centre');
    expect(text).toContain('• Cement (OPC 53): 50 bags');
    expect(text).toContain('• TMT Rods & Steel (12 mm): 500 kg');
    expect(text).toContain('Delivery area: Naxalbari');
    expect(text).toContain('Name: Rahul Das');
    expect(text).toContain('Phone: +919876543210');
    expect(text).toContain('Notes: Need by Saturday morning');

    // Fallback link after submit carries the identical href
    const fallback = page.getByTestId('quote-whatsapp-link');
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAttribute('href', href);

    // Analytics: started + submitted, and no personal data in params
    const events = await trackedEvents(page);
    expect(events.filter((e) => e.name === 'quote_started')).toHaveLength(1);
    const submitted = events.find((e) => e.name === 'quote_submitted');
    expect(submitted).toBeTruthy();
    expect(JSON.stringify(submitted?.params)).not.toContain('Rahul');
    expect(JSON.stringify(submitted?.params)).not.toContain('9876543210');
  });

  test('?add=<category> pre-selects a material from product cards', async ({ page }) => {
    await page.goto('/products');
    await page.getByTestId('add-tmt').click();
    await expect(page).toHaveURL(/\/quote\/\?add=tmt$/);
    await expect(page.getByTestId('quote-line')).toHaveCount(1);
    await expect(page.getByTestId('quote-line').first()).toContainText('TMT Rods & Steel');
  });

  test('copy fallback puts the message on the clipboard', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only in tests');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/quote?add=cement');
    await page.getByTestId('quantity-input').fill('10');
    await page.getByTestId('copy-message').click();
    await expect(page.getByTestId('copy-message')).toContainText('Copied');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('• Cement: 10 bags');
    expect(clip).toBe(await page.getByTestId('message-preview').innerText());
  });
});
