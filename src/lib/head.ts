import { useEffect } from 'react';
import type { PageSeo } from '@/seo/pages';

/**
 * Client-side head updates on navigation. The initial HTML already carries the
 * correct tags (rendered by entry-server.tsx), so this only runs after hydration.
 */
function setMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

export function useDocumentHead(seo: PageSeo, lang: string): void {
  useEffect(() => {
    document.title = seo.title;
    document.documentElement.lang = lang;
    setMeta('meta[name="description"]', { name: 'description', content: seo.description });
    setMeta('link[rel="canonical"]', { rel: 'canonical', href: seo.canonical });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: seo.description,
    });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: seo.canonical });
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: seo.noindex ? 'noindex, nofollow' : 'index, follow',
    });

    // Replace route-specific JSON-LD blocks
    for (const old of document.head.querySelectorAll('script[data-jsonld="route"]')) old.remove();
    for (const block of seo.jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.jsonld = 'route';
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
    }
  }, [seo, lang]);
}
