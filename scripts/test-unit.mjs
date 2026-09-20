#!/usr/bin/env node
// Bundles tests/unit/*.test.ts with esbuild (so `@/` aliases and TS work) and runs
// them with Node's built-in test runner. No extra test framework needed.
//   npm run test:unit
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { loadPublicEnv } from './lib/env.mjs';

const root = process.cwd();
const outDir = path.join(root, '.tmp', 'unit');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const tests = fs
  .readdirSync(path.join(root, 'tests', 'unit'))
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => path.join('tests', 'unit', f));

// Unit tests exercise both the configured and the unconfigured WhatsApp state,
// so the build injects a known test number that tests can override via function args.
const { define } = loadPublicEnv('test', root);
define['import.meta.env.PUBLIC_WHATSAPP_E164'] = JSON.stringify('919999999999');
define['import.meta.env.PUBLIC_PHONE_E164'] = JSON.stringify('');
define['import.meta.env.PUBLIC_SITE_URL'] = JSON.stringify('https://example.test/REPO');
define['import.meta.env.PUBLIC_BASE_PATH'] = JSON.stringify('/REPO');

await esbuild.build({
  entryPoints: tests,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outdir: outDir,
  outExtension: { '.js': '.mjs' },
  define,
  jsx: 'automatic',
  external: ['node:*'],
  logLevel: 'warning',
});

const built = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => path.join(outDir, f));
const result = spawnSync(process.execPath, ['--test', ...built], { stdio: 'inherit' });
process.exit(result.status ?? 1);
