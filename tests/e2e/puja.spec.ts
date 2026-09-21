import { expect, test } from 'playwright/test';
import { TEST_WHATSAPP_E164 } from '../../playwright.config';
import { captureOpenedWhatsApp, decodeWaText } from './helpers';

/**
 * Puja Samagri is a new category with its own two quote fields (which puja, and
 * the date it is needed by). These tests pin the whole path: the category exists,
 * the extra step only appears when it is relevant, and both fields survive into
 * the WhatsApp message the shopkeeper actually reads.
 */
test.describe('Puja Samagri', () => {
  test('appears as a category on Home and Products', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Puja Samagri / Puja Materials' }),
    ).toBeVisible();
    await page.goto('/products');
    await expect(page.locator('#puja-samagri')).toBeVisible();
    await expect(page.locator('#puja-samagri')).toContainText('Puja Samagri available here');
  });

  test('the Puja details step stays hidden until a puja line is added', async ({ page }) => {
    await page.goto('/quote');
    await expect(page.getByTestId('puja-fieldset')).toHaveCount(0);

    await page.getByTestId('pick-cement').click();
    await expect(page.getByTestId('puja-fieldset')).toHaveCount(0);

    await page.getByTestId('pick-puja').click();
    await expect(page.getByTestId('puja-fieldset')).toBeVisible();
    await expect(page.getByTestId('festival-input')).toBeVisible();
    await expect(page.getByTestId('required-date-input')).toBeVisible();
  });

  test('carries items, set count, festival and required date into WhatsApp', async ({
    page,
    context,
  }) => {
    await page.goto('/quote?add=puja');
    await expect(page.getByTestId('quote-line')).toHaveCount(1);
    await expect(page.getByTestId('puja-fieldset')).toBeVisible();

    await page.locator('input[data-field="spec"]').fill('dhoop, batti, sindoor');
    await page.getByTestId('quantity-input').fill('3');
    await expect(page.locator('select[data-field="unit"]')).toHaveValue('sets');

    await page.getByTestId('festival-input').fill('Lakshmi Puja');
    await page.getByTestId('required-date-input').fill('2030-10-12');
    await page.getByTestId('delivery-area').selectOption('Debidanga');
    await page.getByTestId('name-input').fill('Sita Devi');
    await page.getByTestId('phone-input').fill('98765 43210');

    const preview = page.getByTestId('message-preview');
    await expect(preview).toContainText('Puja Samagri');
    await expect(preview).toContainText('Puja / festival: Lakshmi Puja');
    await expect(preview).toContainText('Needed by: 12 Oct 2030');

    const href = await captureOpenedWhatsApp(context, () =>
      page.getByTestId('submit-quote').click(),
    );
    const { number, text } = decodeWaText(href);
    expect(number).toBe(TEST_WHATSAPP_E164);
    expect(text).toContain('• Puja Samagri / Puja Materials (dhoop, batti, sindoor): 3 sets');
    expect(text).toContain('Puja / festival: Lakshmi Puja');
    expect(text).toContain('Needed by: 12 Oct 2030');
    expect(text).toContain('Name: Sita Devi');
  });

  test('rejects a required date in the past', async ({ page }) => {
    await page.goto('/quote?add=puja');
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('required-date-input').fill('2020-01-01');
    await page.getByTestId('delivery-area').selectOption('Debidanga');
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('phone-input').fill('9876543210');
    await page.getByTestId('submit-quote').click();
    await expect(page.getByTestId('required-date-input')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('error-summary')).toContainText('today or later');
  });

  test('a non-puja quote never mentions puja fields', async ({ page, context }) => {
    await page.goto('/quote?add=cement');
    await page.getByTestId('quantity-input').fill('20');
    await page.getByTestId('delivery-area').selectOption('Matigara');
    await page.getByTestId('name-input').fill('Rahul Das');
    await page.getByTestId('phone-input').fill('9876543210');
    const href = await captureOpenedWhatsApp(context, () =>
      page.getByTestId('submit-quote').click(),
    );
    const { text } = decodeWaText(href);
    expect(text).not.toContain('Puja / festival');
    expect(text).not.toContain('Needed by');
  });
});
