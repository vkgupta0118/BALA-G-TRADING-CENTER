// Loads PUBLIC_* variables from .env files (Vite-style precedence) and turns them
// into esbuild `define` entries for `import.meta.env.*`.
//
// Precedence (lowest → highest): .env, .env.<mode>, .env.local, .env.<mode>.local, process.env
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_PREFIX = 'PUBLIC_';

/** Known keys – declared here so the bundle never receives an undefined reference. */
export const PUBLIC_KEYS = [
  'PUBLIC_WHATSAPP_E164',
  'PUBLIC_PHONE_E164',
  'PUBLIC_SITE_URL',
  'PUBLIC_BASE_PATH',
  'PUBLIC_BUSINESS_NAME',
  'PUBLIC_MAPS_URL',
  'PUBLIC_SHOW_BRANDS',
  'PUBLIC_DELIVERY_VERIFIED',
  'PUBLIC_HOURS_VERIFIED',
  'PUBLIC_CONTACT_EMAIL',
  'PUBLIC_GA4_MEASUREMENT_ID',
  'PUBLIC_GOOGLE_ADS_ID',
  'PUBLIC_META_PIXEL_ID',
];

function parseDotenv(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function loadPublicEnv(mode, root = process.cwd()) {
  const files = ['.env', `.env.${mode}`, '.env.local', `.env.${mode}.local`];
  const merged = {};
  for (const file of files) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) Object.assign(merged, parseDotenv(fs.readFileSync(full, 'utf8')));
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith(PUBLIC_PREFIX) && v !== undefined) merged[k] = v;
  }

  const env = {};
  for (const key of PUBLIC_KEYS) env[key] = merged[key] ?? '';
  // Allow extra PUBLIC_ keys too.
  for (const [k, v] of Object.entries(merged)) if (k.startsWith(PUBLIC_PREFIX)) env[k] = v;

  // Sub-path the site is served from (e.g. "/REPO" on a GitHub Pages project site). '' = domain root.
  env.PUBLIC_BASE_PATH = normaliseBasePath(env.PUBLIC_BASE_PATH);

  env.MODE = mode;
  env.DEV = mode !== 'production';
  env.PROD = mode === 'production';

  const define = {};
  for (const [k, v] of Object.entries(env)) define[`import.meta.env.${k}`] = JSON.stringify(v);
  define['import.meta.env'] = JSON.stringify(env);
  return { env, define };
}

export function normaliseBasePath(value) {
  const trimmed = String(value ?? '')
    .trim()
    .replace(/\/+$/, '');
  if (!trimmed || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Prints actionable warnings for missing launch-critical configuration. */
export function reportEnv(env, { strict = false } = {}) {
  const problems = [];
  if (!env.PUBLIC_WHATSAPP_E164) {
    problems.push(
      'PUBLIC_WHATSAPP_E164 is empty – WhatsApp buttons will render a "number not configured" state instead of links.',
    );
  } else if (!/^[1-9]\d{7,14}$/.test(env.PUBLIC_WHATSAPP_E164)) {
    problems.push(
      `PUBLIC_WHATSAPP_E164="${env.PUBLIC_WHATSAPP_E164}" is not E.164 digits (country code + number, digits only, no "+").`,
    );
  }
  if (!env.PUBLIC_SITE_URL) {
    problems.push(
      'PUBLIC_SITE_URL is empty – canonical URLs, Open Graph URLs, sitemap.xml and robots.txt will use a placeholder host.',
    );
  }
  for (const p of problems) console.warn(`[env] WARNING: ${p}`);
  if (strict && problems.length) {
    throw new Error(
      'Refusing to build for production with missing configuration (set STRICT_ENV=0 to override).',
    );
  }
  return problems;
}
