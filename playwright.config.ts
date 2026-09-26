import { defineConfig, devices } from 'playwright/test';

/**
 * E2E tests run against the PRODUCTION build served by scripts/preview.mjs.
 * Test-only placeholder numbers are injected so link generation can be verified
 * without a real WhatsApp number. They never reach a deployed build.
 */
export const TEST_WHATSAPP_E164 = '919999999999';
export const TEST_PHONE_E164 = '918888888888';
export const TEST_SITE_URL = 'https://example.test';
export const TEST_MAPS_URL = 'https://maps.app.goo.gl/9FQnudyceXPjySFi7';
export const TEST_SITE_VERIFICATION = 'test-site-verification-token';

const PORT = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `node scripts/build.mjs && node scripts/preview.mjs --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      PUBLIC_WHATSAPP_E164: TEST_WHATSAPP_E164,
      PUBLIC_PHONE_E164: TEST_PHONE_E164,
      PUBLIC_SITE_URL: TEST_SITE_URL,
      PUBLIC_BASE_PATH: '', // tests run at the domain root; .env.production may set a sub-path
      PUBLIC_MAPS_URL: TEST_MAPS_URL,
      PUBLIC_GOOGLE_SITE_VERIFICATION: TEST_SITE_VERIFICATION,
      PUBLIC_GA4_MEASUREMENT_ID: '',
      PUBLIC_META_PIXEL_ID: '',
      PUBLIC_GOOGLE_ADS_ID: '',
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
