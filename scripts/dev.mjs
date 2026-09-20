#!/usr/bin/env node
// Development server: esbuild watch + serve with live reload.
//   npm run dev            → http://localhost:5173
//   PORT=3000 npm run dev  → custom port
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { loadPublicEnv, reportEnv } from './lib/env.mjs';
import { copyDir, readTemplate, renderDocument } from './lib/html.mjs';

const root = process.cwd();
const outDir = path.join(root, 'dist-dev');
const port = Number(process.env.PORT ?? 5173);
const { env, define } = loadPublicEnv('development', root);
reportEnv(env);

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
copyDir(path.join(root, 'public'), outDir);

const liveReload = `<script>new EventSource('/esbuild').addEventListener('change', () => location.reload());</script>`;
const document = renderDocument(readTemplate(root), {
  head: '<title>Dev · Balajee Trading Centre</title>',
  app: '',
  scripts: ['/assets/main.js'],
  styles: ['/assets/main.css'],
  bodyEnd: liveReload,
});
fs.writeFileSync(path.join(outDir, 'index.html'), document);

const ctx = await esbuild.context({
  entryPoints: { main: 'src/main.tsx' },
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  sourcemap: true,
  outdir: path.join(outDir, 'assets'),
  publicPath: '/assets',
  // Fonts/images live in /public and are referenced relatively from the CSS; don't bundle them.
  external: ['*.woff', '*.woff2', '*.png', '*.jpg', '*.webp', '*.svg'],
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'media/[name]-[hash]',
  define: { ...define, 'process.env.NODE_ENV': '"development"' },
  jsx: 'automatic',
  jsxDev: true,
  logLevel: 'info',
});

await ctx.watch();
const { hosts, port: servedPort } = await ctx.serve({
  servedir: outDir,
  port,
  fallback: path.join(outDir, 'index.html'),
});
const host = hosts.find((h) => h === 'localhost') ?? hosts[0] ?? 'localhost';
console.info(`\n  Dev server running at http://${host}:${servedPort}\n`);
