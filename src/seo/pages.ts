import { env } from '@/config/env';
import { site } from '@/config/site';
import { type Lang, translate } from '@/i18n';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  hardwareStoreJsonLd,
  productCategoriesJsonLd,
  websiteJsonLd,
} from './jsonld';

export interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  path: string;
  noindex?: boolean;
  jsonLd: Array<Record<string, unknown>>;
}

export interface StaticRoute {
  path: string;
  /** Output file relative to dist (defaults to <path>/index.html) */
  outputFile?: string;
  excludeFromSitemap?: boolean;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: string;
}

export const staticRoutes: StaticRoute[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/quote', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/404', outputFile: '404.html', excludeFromSitemap: true },
];

const FAQ_KEYS = [1, 2, 3, 4, 5] as const;

export function faqItems(lang: Lang): Array<{ question: string; answer: string }> {
  return FAQ_KEYS.map((n) => ({
    question: translate(lang, `faq.${n}.q`),
    answer: translate(lang, `faq.${n}.a`),
  }));
}

export function getPageSeo(path: string, lang: Lang = 'en'): PageSeo {
  const name = site.name;
  const business = hardwareStoreJsonLd();

  switch (path) {
    case '/':
      return {
        path,
        title: `${name} | Cement, Bricks & TMT Rods in Siliguri – Champasari Road`,
        description:
          'Building materials shop on Champasari Road, Debidanga, Siliguri. Cement, bricks, TMT steel, hardware and more for homeowners, masons and contractors. Get today’s price on WhatsApp.',
        canonical: absoluteUrl('/'),
        jsonLd: [business, websiteJsonLd(), faqJsonLd(faqItems(lang))],
      };
    case '/products':
      return {
        path,
        title: `Cement, Bricks, TMT Rods & Hardware in Siliguri | ${name}`,
        description:
          'Browse the building materials we supply in Siliguri – cement, bricks, TMT reinforcement steel, hardware and other site materials. Request today’s price on WhatsApp.',
        canonical: absoluteUrl('/products'),
        jsonLd: [
          business,
          productCategoriesJsonLd(),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
          ]),
        ],
      };
    case '/quote':
      return {
        path,
        title: `Get a Building Materials Quote on WhatsApp | ${name}, Siliguri`,
        description:
          'List your cement, bricks, TMT rods and hardware with quantities and delivery area. We open WhatsApp with your quote request ready to send – no account needed.',
        canonical: absoluteUrl('/quote'),
        jsonLd: [
          business,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Get a quote', path: '/quote' },
          ]),
        ],
      };
    case '/contact':
      return {
        path,
        title: `Contact ${name} | Champasari Road, Debidanga, Siliguri 734003`,
        description:
          'Call, WhatsApp or visit M/S Balajee Trading Centre near Uttarbanga Kshetriya Gramin Bank on Champasari Road, Debidanga, Siliguri. Directions, hours and enquiry form.',
        canonical: absoluteUrl('/contact'),
        jsonLd: [
          business,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ],
      };
    default:
      return {
        path,
        title: `Page not found | ${name}`,
        description: 'The page you were looking for does not exist.',
        canonical: absoluteUrl('/'),
        noindex: true,
        jsonLd: [business],
      };
  }
}

/** Serialises head tags for the static pre-render. */
export function renderHeadTags(seo: PageSeo, lang: Lang): string {
  const esc = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const ogImage = absoluteUrl('/og-image.png');
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}">`,
    `<meta name="robots" content="${seo.noindex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<link rel="canonical" href="${esc(seo.canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:locale" content="${lang === 'bn' ? 'bn_IN' : 'en_IN'}">`,
    `<meta property="og:title" content="${esc(seo.title)}">`,
    `<meta property="og:description" content="${esc(seo.description)}">`,
    `<meta property="og:url" content="${esc(seo.canonical)}">`,
    `<meta property="og:image" content="${esc(ogImage)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(`${site.name} – building materials, Siliguri`)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(seo.title)}">`,
    `<meta name="twitter:description" content="${esc(seo.description)}">`,
    `<meta name="twitter:image" content="${esc(ogImage)}">`,
    `<meta name="geo.region" content="IN-WB">`,
    `<meta name="geo.placename" content="Siliguri">`,
    // Search Console ownership check – only when a token is configured.
    ...(env.googleSiteVerification
      ? [`<meta name="google-site-verification" content="${esc(env.googleSiteVerification)}">`]
      : []),
    ...seo.jsonLd.map(
      (block) =>
        `<script type="application/ld+json" data-jsonld="route">${JSON.stringify(block).replaceAll('</', '<\\/')}</script>`,
    ),
  ];
  return tags.join('\n    ');
}
