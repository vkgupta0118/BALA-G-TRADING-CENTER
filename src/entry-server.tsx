import { renderToString } from 'react-dom/server';
import { App } from './App';
import type { Lang } from './i18n';
import { getPageSeo, renderHeadTags, type StaticRoute, staticRoutes } from './seo/pages';

/**
 * Used only at build time (scripts/build.mjs) to pre-render each route.
 * Bengali is a client-side toggle, so static HTML is rendered in English.
 */
export function getStaticRoutes(): StaticRoute[] {
  return staticRoutes;
}

export function render(
  path: string,
  lang: Lang = 'en',
): { html: string; head: string; lang: Lang } {
  const routePath = path === '/404' ? '/__not_found__' : path;
  const html = renderToString(<App url={routePath} lang={lang} />);
  const seo = getPageSeo(routePath, lang);
  return { html, head: renderHeadTags(seo, lang), lang };
}
