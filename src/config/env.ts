/**
 * Single access point for build-time configuration.
 * Components must import from here – never read import.meta.env directly and
 * never hard-code phone numbers, IDs or domains anywhere else.
 */

const E164_DIGITS = /^[1-9]\d{7,14}$/;

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

function flag(value: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test(clean(value));
}

/** Normalises "+91 93391 88629" → "919339188629"; returns '' when invalid. */
export function normaliseE164(value: string | undefined): string {
  const digits = clean(value).replace(/[^\d]/g, '');
  return E164_DIGITS.test(digits) ? digits : '';
}

const whatsapp = normaliseE164(import.meta.env.PUBLIC_WHATSAPP_E164);
const phone = normaliseE164(import.meta.env.PUBLIC_PHONE_E164) || whatsapp;
const siteUrl = clean(import.meta.env.PUBLIC_SITE_URL).replace(/\/+$/, '');
const basePathRaw = clean(import.meta.env.PUBLIC_BASE_PATH).replace(/\/+$/, '');
const basePath =
  !basePathRaw || basePathRaw === '/'
    ? ''
    : basePathRaw.startsWith('/')
      ? basePathRaw
      : `/${basePathRaw}`;

export const env = {
  isDev: Boolean(import.meta.env.DEV),
  /** E.164 digits for WhatsApp, or '' when not configured. */
  whatsappE164: whatsapp,
  /** Raw value as supplied – used only to explain configuration errors in dev. */
  whatsappRaw: clean(import.meta.env.PUBLIC_WHATSAPP_E164),
  /** E.164 digits for click-to-call, or '' when not configured. */
  phoneE164: phone,
  siteUrl,
  /** Sub-path the site is served from ('' at the domain root, '/REPO' on a GitHub Pages project site). */
  basePath,
  businessName: clean(import.meta.env.PUBLIC_BUSINESS_NAME) || 'M/S Balajee Trading Centre',
  mapsUrl: clean(import.meta.env.PUBLIC_MAPS_URL) || 'https://maps.app.goo.gl/9FQnudyceXPjySFi7',
  showBrands: flag(import.meta.env.PUBLIC_SHOW_BRANDS),
  deliveryVerified: flag(import.meta.env.PUBLIC_DELIVERY_VERIFIED),
  hoursVerified: flag(import.meta.env.PUBLIC_HOURS_VERIFIED),
  /** Trading name of the Puja Samagri counter, or '' when the owner has not confirmed one. */
  pujaCounterName: clean(import.meta.env.PUBLIC_PUJA_COUNTER_NAME),
  contactEmail: clean(import.meta.env.PUBLIC_CONTACT_EMAIL),
  ga4Id: clean(import.meta.env.PUBLIC_GA4_MEASUREMENT_ID),
  googleAdsId: clean(import.meta.env.PUBLIC_GOOGLE_ADS_ID),
  metaPixelId: clean(import.meta.env.PUBLIC_META_PIXEL_ID),
} as const;

export type Env = typeof env;

/** Formats E.164 digits for display: 919339188629 → "+91 93391 88629" (Indian grouping) or "+<cc> <rest>". */
export function formatE164ForDisplay(e164: string): string {
  if (!e164) return '';
  if (e164.startsWith('91') && e164.length === 12) {
    return `+91 ${e164.slice(2, 7)} ${e164.slice(7)}`;
  }
  return `+${e164}`;
}

/** Prefixes an internal path with the configured base path: withBase('/quote') → '/REPO/quote'. */
export function withBase(path: string): string {
  if (!env.basePath) return path;
  if (path === '/' || path === '') return `${env.basePath}/`;
  return path.startsWith('/') ? `${env.basePath}${path}` : path;
}

/** Removes the base path from a browser pathname: stripBase('/REPO/quote') → '/quote'. */
export function stripBase(pathname: string): string {
  if (env.basePath && (pathname === env.basePath || pathname.startsWith(`${env.basePath}/`))) {
    const rest = pathname.slice(env.basePath.length);
    return rest === '' ? '/' : rest;
  }
  return pathname;
}
