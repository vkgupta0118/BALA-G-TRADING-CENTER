#!/usr/bin/env node
// Production build:
//  1. bundles the client (code-split, minified, hashed) into dist/assets
//  2. bundles a server renderer and pre-renders every route to static HTML
//     (real HTML for crawlers + instant first paint, then React hydrates)
//  3. copies /public, writes robots.txt + sitemap.xml from PUBLIC_SITE_URL
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { loadPublicEnv, reportEnv } from './lib/env.mjs';
import { copyDir, readTemplate, renderDocument } from './lib/html.mjs';

const root = process.cwd();
const mode = process.env.MODE ?? 'production';
const outDir = path.join(root, 'dist');
const tmpDir = path.join(root, '.tmp', 'server');
const { env, define } = loadPublicEnv(mode, root);

const strict = process.env.STRICT_ENV === '1';
reportEnv(env, { strict });
const base = env.PUBLIC_BASE_PATH; // '' or '/sub-path'
if (base) console.info(`[build] serving from sub-path "${base}/" (PUBLIC_BASE_PATH)`);

fs.rmSync(outDir, { recursive: true, force: true });
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const target = ['es2020', 'chrome90', 'safari15', 'firefox90', 'edge90'];

// 1. Client bundle -----------------------------------------------------------
const client = await esbuild.build({
  entryPoints: { main: 'src/main.tsx' },
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  target,
  minify: true,
  sourcemap: false,
  metafile: true,
  outdir: path.join(outDir, 'assets'),
  publicPath: `${base}/assets`,
  // Fonts/images live in /public and are referenced relatively from the CSS; don't bundle them.
  external: ['*.woff', '*.woff2', '*.png', '*.jpg', '*.webp', '*.svg'],
  entryNames: '[name]-[hash]',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'media/[name]-[hash]',
  define: { ...define, 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
  legalComments: 'none',
  logLevel: 'info',
});

const outputs = Object.entries(client.metafile.outputs);
const mainJs = outputs.find(([, o]) => o.entryPoint === 'src/main.tsx')?.[0];
const mainCss = outputs.find(([file]) => file.endsWith('.css') && file.includes('/main-'))?.[0];
if (!mainJs) throw new Error('Could not find client entry in metafile');
const toHref = (file) =>
  `${base}/${path.relative(outDir, path.join(root, file)).split(path.sep).join('/')}`;
const scripts = [toHref(mainJs)];
const styles = mainCss ? [toHref(mainCss)] : [];
const preloads = (client.metafile.outputs[mainJs]?.imports ?? [])
  .filter((i) => i.kind === 'import-statement')
  .map((i) => toHref(i.path));

// 2. Server renderer -----------------------------------------------------------
await esbuild.build({
  entryPoints: { 'entry-server': 'src/entry-server.tsx' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  outdir: tmpDir,
  outExtension: { '.js': '.mjs' },
  define: { ...define, 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
  logLevel: 'warning',
  // react-dom/server is CommonJS and calls require('util') etc. – give the ESM bundle a real require().
  banner: {
    js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);",
  },
  // CSS is handled by the client bundle; ignore it in the server bundle.
  loader: { '.css': 'empty' },
});

const server = await import(pathToFileURL(path.join(tmpDir, 'entry-server.mjs')).href);
// Static references in the template (favicon, manifest, font preloads) get the base path too.
const template = readTemplate(root).replaceAll('href="/', `href="${base}/`);
const siteUrl = env.PUBLIC_SITE_URL || 'https://REPLACE-WITH-YOUR-DOMAIN.example';

const routes = server.getStaticRoutes();
for (const route of routes) {
  const { html, head, lang } = server.render(route.path);
  const document = renderDocument(template, { lang, head, app: html, scripts, styles, preloads });
  const file =
    route.outputFile ??
    (route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}/index.html`);
  const full = path.join(outDir, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, document);
  console.info(`  prerendered ${route.path} → ${path.relative(root, full)}`);
}

// 3. Static files, robots, sitemap, manifest -----------------------------------
copyDir(path.join(root, 'public'), outDir);
fs.writeFileSync(
  path.join(outDir, 'site.webmanifest'),
  JSON.stringify(
    {
      name: env.PUBLIC_BUSINESS_NAME || 'M/S Balajee Trading Centre',
      short_name: 'Balajee Trading',
      description:
        'Cement, bricks, TMT rods and hardware in Siliguri – get today’s price on WhatsApp.',
      start_url: `${base}/`,
      scope: `${base}/`,
      display: 'browser',
      background_color: '#1C1917',
      theme_color: '#1C1917',
      icons: [
        { src: `${base}/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
        { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ),
);

const publicRoutes = routes.filter((r) => !r.excludeFromSitemap);
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (r) => `  <url>
    <loc>${siteUrl}${r.path === '/' ? '/' : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq ?? 'monthly'}</changefreq>
    <priority>${r.priority ?? '0.7'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(
  path.join(outDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

fs.rmSync(path.join(root, '.tmp'), { recursive: true, force: true });

const totalBytes = outputs.reduce((n, [, o]) => n + o.bytes, 0);
console.info(
  `\nBuild complete → dist/ (${routes.length} pages, ${(totalBytes / 1024).toFixed(1)} KB of JS/CSS)`,
);
if (!env.PUBLIC_SITE_URL) {
  console.warn(
    '[build] sitemap.xml/robots.txt contain a placeholder host. Set PUBLIC_SITE_URL before deploying.',
  );
}
