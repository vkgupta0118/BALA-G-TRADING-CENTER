/// <reference types="react" />
/// <reference types="react-dom" />

/**
 * Build-time environment injected by scripts/lib/env.mjs.
 * Only PUBLIC_* keys are exposed to the browser bundle.
 */
interface ImportMetaEnv {
  readonly MODE: 'development' | 'production' | string;
  readonly DEV: boolean;
  readonly PROD: boolean;

  readonly PUBLIC_WHATSAPP_E164: string;
  readonly PUBLIC_PHONE_E164: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_BASE_PATH: string;
  readonly PUBLIC_BUSINESS_NAME: string;
  readonly PUBLIC_MAPS_URL: string;
  readonly PUBLIC_SHOW_BRANDS: string;
  readonly PUBLIC_DELIVERY_VERIFIED: string;
  readonly PUBLIC_HOURS_VERIFIED: string;
  readonly PUBLIC_CONTACT_EMAIL: string;
  readonly PUBLIC_GA4_MEASUREMENT_ID: string;
  readonly PUBLIC_GOOGLE_ADS_ID: string;
  readonly PUBLIC_META_PIXEL_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {}
