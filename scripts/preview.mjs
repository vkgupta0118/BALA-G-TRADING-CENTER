#!/usr/bin/env node
// Zero-dependency static server for the production build in dist/.
//   npm run preview -- --port 4173
// Behaviour mirrors common static hosts: /products → /products/index.html, unknown → 404.html
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg > -1 ? process.argv[portArg + 1] : (process.env.PORT ?? 4173));
const baseArg = process.argv.indexOf('--base');
// Sub-path the build expects (mirrors PUBLIC_BASE_PATH), e.g. "/REPO" for a GitHub Pages project site.
const rawBase = (baseArg > -1 ? process.argv[baseArg + 1] : (process.env.PUBLIC_BASE_PATH ?? ''))
  .trim()
  .replace(/\/+$/, '');
const base = !rawBase || rawBase === '/' ? '' : rawBase.startsWith('/') ? rawBase : `/${rawBase}`;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function resolve(urlPath) {
  let clean = decodeURIComponent(urlPath.split('?')[0]).replace(/\/+$/, '') || '/';
  if (base) {
    if (clean === base || clean.startsWith(`${base}/`)) clean = clean.slice(base.length) || '/';
    else return { full: path.join(dist, '404.html'), status: 404 };
  }
  const candidates =
    clean === '/'
      ? ['index.html']
      : [clean.slice(1), path.join(clean.slice(1), 'index.html'), `${clean.slice(1)}.html`];
  for (const c of candidates) {
    const full = path.join(dist, c);
    if (!full.startsWith(dist)) continue;
    if (fs.existsSync(full) && fs.statSync(full).isFile()) return { full, status: 200 };
  }
  return { full: path.join(dist, '404.html'), status: 404 };
}

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

http
  .createServer((req, res) => {
    const { full, status } = resolve(req.url ?? '/');
    if (!fs.existsSync(full)) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(full).toLowerCase();
    const immutable = full.includes(`${path.sep}assets${path.sep}`);
    res.writeHead(status, {
      'content-type': types[ext] ?? 'application/octet-stream',
      'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'x-content-type-options': 'nosniff',
    });
    fs.createReadStream(full).pipe(res);
  })
  .listen(port, () => console.info(`  Preview server: http://localhost:${port}${base}/`));
