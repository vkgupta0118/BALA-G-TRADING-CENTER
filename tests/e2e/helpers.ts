import type { BrowserContext, Page } from 'playwright/test';

export interface TrackedEvent {
  name: string;
  params: Record<string, string | number | boolean>;
  ts: number;
}

/** Reads the analytics event queue exposed by src/lib/analytics.ts. */
export async function trackedEvents(page: Page): Promise<TrackedEvent[]> {
  return page.evaluate(
    () => (window as Window & { __bt_events?: TrackedEvent[] }).__bt_events ?? [],
  );
}

/** Prevents real navigation for tel:/external links while still firing click handlers. */
export async function blockNavigation(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.addEventListener(
      'click',
      (e) => {
        const a = (e.target as HTMLElement).closest('a');
        if (a) e.preventDefault();
      },
      { capture: true },
    );
  });
}

export function decodeWaText(href: string): { number: string; text: string } {
  const url = new URL(href);
  return { number: url.pathname.replace('/', ''), text: url.searchParams.get('text') ?? '' };
}

/**
 * wa.me is an external host. Serve a stub for it so window.open() popups navigate
 * successfully and we can read the exact URL the site generated.
 */
export async function stubWhatsApp(context: BrowserContext): Promise<void> {
  await context.route('https://wa.me/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<title>wa.me stub</title>' }),
  );
}

export async function captureOpenedWhatsApp(
  context: BrowserContext,
  trigger: () => Promise<void>,
): Promise<string> {
  await stubWhatsApp(context);
  const popupPromise = context.waitForEvent('page');
  await trigger();
  const popup = await popupPromise;
  await popup.waitForURL(/^https:\/\/wa\.me\//);
  const url = popup.url();
  await popup.close();
  return url;
}
