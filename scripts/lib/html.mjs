// Renders the final HTML document from the template in /index.html.
import fs from 'node:fs';
import path from 'node:path';

export function readTemplate(root = process.cwd()) {
  return fs.readFileSync(path.join(root, 'index.html'), 'utf8');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * @param {string} template
 * @param {{ lang?: string, head: string, app: string, scripts: string[], styles: string[], preloads?: string[], extraHead?: string, bodyEnd?: string }} parts
 */
export function renderDocument(template, parts) {
  const styles = parts.styles
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join('\n    ');
  const scripts = parts.scripts
    .map((src) => `<script type="module" src="${src}"></script>`)
    .join('\n    ');
  const preloads = (parts.preloads ?? [])
    .map((href) => `<link rel="modulepreload" href="${href}">`)
    .join('\n    ');
  return template
    .replace('<html lang="en">', `<html lang="${parts.lang ?? 'en'}">`)
    .replace(
      '<!--app-head-->',
      `${parts.head}\n    ${styles}\n    ${preloads}\n    ${parts.extraHead ?? ''}`,
    )
    .replace('<!--app-html-->', parts.app)
    .replace('<!--app-scripts-->', scripts)
    .replace('<!--app-body-end-->', parts.bodyEnd ?? '');
}

export function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
