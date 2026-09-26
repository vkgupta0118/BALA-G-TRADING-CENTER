import { expect, type Page, test } from 'playwright/test';

async function activeTestIdOrText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return '';
    return (
      el.dataset.testid ?? el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName
    );
  });
}

async function focusOutlineVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) >= 2;
  });
}

test.describe('Keyboard navigation', () => {
  test('skip link is the first tab stop and moves focus to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('header controls are reachable with a visible focus ring', async ({ page, isMobile }) => {
    await page.goto('/');
    const seen: string[] = [];
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      seen.push(await activeTestIdOrText(page));
      expect(await focusOutlineVisible(page)).toBe(true);
    }
    // brand link + language control + (nav links or menu toggle) must all be in the tab order
    expect(seen.some((s) => s.includes('Balajee'))).toBe(true);
    if (isMobile) {
      expect(seen).toContain('lang-toggle');
      expect(seen).toContain('menu-toggle');
    } else {
      expect(seen).toContain('lang-en');
      expect(seen).toContain('lang-bn');
      expect(seen).toContain('Products');
      expect(seen).toContain('whatsapp-link');
    }
  });

  test('mobile menu opens with Enter, traps nothing, and closes with Escape', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile menu only');
    await page.goto('/');
    await page.getByTestId('menu-toggle').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByTestId('mobile-menu');
    await expect(menu).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Home' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(page.getByTestId('menu-toggle')).toBeFocused();
  });

  test('client-side navigation moves focus to the new page content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'uses desktop nav');
    await page.goto('/');
    await page.getByRole('link', { name: 'Products', exact: true }).first().focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/products\/$/);
    await expect(page.locator('#main')).toBeFocused();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('What we supply');
    await expect(page).toHaveTitle(/Cement, Bricks, TMT Rods & Hardware in Siliguri/);
  });

  test('quote builder is fully operable by keyboard', async ({ page }) => {
    await page.goto('/quote');
    await page.getByTestId('pick-cement').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('quantity-input')).toBeFocused();
    await page.keyboard.type('40');
    await page.keyboard.press('Tab'); // unit select
    await expect(page.locator('select[data-field="unit"]')).toBeFocused();

    // Submit with Enter from a field → validation summary receives focus
    await page.getByTestId('name-input').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('error-summary')).toBeFocused();
    // Error summary link jumps to the field
    await page.getByTestId('error-summary').locator('a[href="#phone"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('phone-input')).toBeFocused();
  });

  test('FAQ accordions toggle with the keyboard', async ({ page }) => {
    await page.goto('/');
    const second = page.locator('.faq details').nth(1);
    await second.scrollIntoViewIfNeeded();
    await second.locator('summary').focus();
    await expect(second).not.toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(second).not.toHaveAttribute('open', '');
  });
});
