import { env } from '@/config/env';

/**
 * Privacy-conscious analytics event layer.
 *
 * - One `track()` API; providers (GA4 / Google Ads / Meta Pixel) are loaded ONLY
 *   when their ID is configured AND the visitor has given consent.
 * - Events never carry personal data (no names, phone numbers or message text).
 * - Every event is also pushed to `window.__bt_events` so E2E tests and the owner
 *   can verify tracking without any third-party account.
 */

export type AnalyticsEvent =
  | 'whatsapp_click'
  | 'call_click'
  | 'directions_click'
  | 'quote_started'
  | 'quote_submitted'
  | 'language_change'
  | 'consent_update';

export type EventParams = Record<string, string | number | boolean>;

export type ConsentState = 'unknown' | 'granted' | 'denied';

const CONSENT_KEY = 'bt-analytics-consent';
const DENYLIST = new Set(['name', 'phone', 'email', 'message', 'notes', 'text']);

declare global {
  interface Window {
    __bt_events?: Array<{ name: AnalyticsEvent; params: EventParams; ts: number }>;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function hasAnyProvider(): boolean {
  return Boolean(env.ga4Id || env.googleAdsId || env.metaPixelId);
}

export function getConsent(): ConsentState {
  if (!isBrowser()) return 'unknown';
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : 'unknown';
  } catch {
    return 'unknown';
  }
}

export function setConsent(state: Exclude<ConsentState, 'unknown'>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
  } catch {
    /* storage unavailable – fine, session-only */
  }
  track('consent_update', { state });
  if (state === 'granted') loadProviders();
}

let providersLoaded = false;

function injectScript(src: string, id: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  s.id = id;
  document.head.appendChild(s);
}

/** Loads third-party tags. Idempotent. Never called without consent. */
export function loadProviders(): void {
  if (!isBrowser() || providersLoaded || !hasAnyProvider()) return;
  if (getConsent() !== 'granted') return;
  providersLoaded = true;

  if (env.ga4Id || env.googleAdsId) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag =
      window.gtag ??
      function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    window.gtag('js', new Date());
    const primary = env.ga4Id || env.googleAdsId;
    injectScript(
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primary)}`,
      'bt-gtag',
    );
    if (env.ga4Id)
      window.gtag('config', env.ga4Id, { anonymize_ip: true, allow_google_signals: false });
    if (env.googleAdsId)
      window.gtag('config', env.googleAdsId, { allow_ad_personalization_signals: false });
  }

  if (env.metaPixelId) {
    const w = window as Window & { _fbq?: unknown };
    if (!w.fbq) {
      const queue: unknown[][] = [];
      const fbq = ((...args: unknown[]) => {
        queue.push(args);
      }) as typeof window.fbq & {
        queue?: unknown[][];
        loaded?: boolean;
        version?: string;
        push?: unknown;
      };
      fbq.queue = queue;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = fbq;
      w.fbq = fbq;
      w._fbq = fbq;
    }
    window.fbq?.('init', env.metaPixelId);
    window.fbq?.('track', 'PageView');
    injectScript('https://connect.facebook.net/en_US/fbevents.js', 'bt-fbq');
  }
}

function sanitise(params: EventParams): EventParams {
  const out: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (DENYLIST.has(k.toLowerCase())) continue;
    out[k] = v;
  }
  return out;
}

const META_EVENT: Partial<Record<AnalyticsEvent, string>> = {
  quote_submitted: 'Lead',
  whatsapp_click: 'Contact',
  call_click: 'Contact',
};

/** Records a conversion-relevant event. Safe to call during SSR (no-op). */
export function track(name: AnalyticsEvent, params: EventParams = {}): void {
  if (!isBrowser()) return;
  const clean = sanitise({ ...params, page_path: window.location.pathname });

  window.__bt_events = window.__bt_events ?? [];
  window.__bt_events.push({ name, params: clean, ts: Date.now() });
  if (env.isDev) console.info('[analytics]', name, clean);

  if (getConsent() !== 'granted') return;
  window.gtag?.('event', name, clean);
  const metaName = META_EVENT[name];
  if (metaName) window.fbq?.('track', metaName, { content_name: name });
}

/** Call once on app start: loads providers if consent was previously granted. */
export function initAnalytics(): void {
  if (!isBrowser()) return;
  if (getConsent() === 'granted') loadProviders();
}
