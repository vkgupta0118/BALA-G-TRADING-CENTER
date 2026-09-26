import { env, formatE164ForDisplay, withTrailingSlash } from '@/config/env';
import { productCategories } from '@/config/products';
import { site } from '@/config/site';

/**
 * Absolute URL helper – falls back to a path when PUBLIC_SITE_URL is not yet set.
 * Page paths get their trailing slash so canonical and og:url name the URL the host
 * actually serves (no redirect): absoluteUrl('/products') → '<site>/products/'.
 */
export function absoluteUrl(path: string): string {
  const normalised = withTrailingSlash(path);
  return env.siteUrl ? `${env.siteUrl}${normalised}` : normalised;
}

type JsonLd = Record<string, unknown>;

export function hardwareStoreJsonLd(): JsonLd {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HardwareStore'],
    '@id': `${absoluteUrl('/')}#business`,
    name: site.name,
    alternateName: site.legalNameAlternatives,
    description: `${site.name} supplies cement, bricks, TMT rods, hardware and building materials to homeowners, masons and contractors in Siliguri from Champasari Road, Debidanga.`,
    url: absoluteUrl('/'),
    image: absoluteUrl('/og-image.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.streetAddress,
      addressLocality: `${site.address.locality}, ${site.address.city}`,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    hasMap: site.mapsUrl,
    areaServed: [{ '@type': 'City', name: 'Siliguri' }],
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    makesOffer: productCategories.map((c) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: c.name, category: c.schemaCategory },
    })),
  };
  if (env.phoneE164) data.telephone = formatE164ForDisplay(env.phoneE164).replace(/\s/g, '');
  if (env.contactEmail) data.email = env.contactEmail;
  if (site.hoursVerified && site.openingHours.length) {
    data.openingHoursSpecification = site.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }
  if (site.showBrands) data.brand = site.brands.map((b) => ({ '@type': 'Brand', name: b }));
  if (site.pujaCounterName) {
    data.department = [
      {
        '@type': 'LocalBusiness',
        name: site.pujaCounterName,
        description: 'Puja Samagri available here.',
        address: data.address,
      },
    ];
  }
  const sameAs = [site.social.facebook, site.social.instagram].filter(Boolean);
  if (sameAs.length) data.sameAs = sameAs;
  return data;
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: absoluteUrl('/'),
    inLanguage: ['en-IN', 'bn-IN'],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productCategoriesJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Building materials supplied by ${site.name}`,
    itemListElement: productCategories.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: c.name,
        description: c.shortDescription,
        category: c.schemaCategory,
        url: `${absoluteUrl('/products')}#${c.slug}`,
      },
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
