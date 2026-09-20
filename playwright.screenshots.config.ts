import { defineConfig } from 'playwright/test';
import base from './playwright.config';

/**
 * Captures responsive screenshots of every page at 375 / 768 / 1024 / 1440 px.
 *   npm run screenshots   → screenshots/<page>-<width>.png
 */
export default defineConfig({
  ...base,
  testDir: 'tests/screenshots',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  projects: [{ name: 'screenshots', use: { browserName: 'chromium' } }],
});
