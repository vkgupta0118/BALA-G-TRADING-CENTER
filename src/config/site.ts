import { env } from './env';

/**
 * Business facts. Anything marked "verify" must be confirmed by the owner
 * before it is shown – the matching PUBLIC_* flag in .env keeps it hidden until then.
 */

export interface OpeningHours {
  /** schema.org day names */
  days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>;
  /** 24h "HH:MM" */
  opens: string;
  closes: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  /** Where the review was left – shown to keep testimonials verifiable. */
  source: 'Google' | 'In-store' | 'WhatsApp';
}

export const site = {
  name: env.businessName,
  /** Short name for tight UI spaces (sticky bar, footer). */
  shortName: 'Balajee Trading',
  /** The shop's printed visiting card reads "M/S BALAJEE TRADING CENTRE", which is the
   *  spelling this site uses. The Google Business Profile still shows
   *  "M.S. BALA G TRADING CENTER" – Google is the outlier and should be corrected there. */
  nameNeedsConfirmation: false,
  legalNameAlternatives: ['M.S. BALA G TRADING CENTER', 'M/S BALAJEE TRADING CENTRE'],
  tagline: 'Cement, bricks, TMT steel and hardware on Champasari Road, Siliguri.',

  address: {
    streetAddress: 'Champasari Road, near Uttarbanga Kshetriya Gramin Bank',
    locality: 'Debidanga',
    city: 'Siliguri',
    region: 'West Bengal',
    postalCode: '734003',
    country: 'IN',
    countryName: 'India',
  },
  /** Landmark wording used in copy. */
  landmark: 'near Uttarbanga Kshetriya Gramin Bank, Debidanga Bazar',
  mapsUrl: env.mapsUrl,

  /**
   * Confirmed by the owner on 2026-09-21: open every day, 8:00 to 18:00.
   * Shown only when PUBLIC_HOURS_VERIFIED=true.
   */
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '18:00',
    },
  ] as OpeningHours[],
  hoursVerified: env.hoursVerified,

  /** The five cement brands printed on the shop's own visiting card, confirmed by the
   *  owner on 2026-09-21. Shown only when PUBLIC_SHOW_BRANDS=true. Listing a brand says
   *  the shop sells it — never that it is an authorised dealer, which needs documentation. */
  brands: [
    'UltraTech Cement',
    'Ambuja Cement',
    'Star Cement',
    'Dalmia Bharat Cement',
    'Emami Double Bull Cement',
  ],
  showBrands: env.showBrands,

  /** Localities customers can pick in the quote builder. This is a selection list, not a delivery promise. */
  serviceAreas: [
    'Champasari',
    'Debidanga',
    'Pradhan Nagar',
    'Matigara',
    'Salugara',
    'Sevoke Road',
    'Hakim Para',
    'Ashram Para',
    'Bhakti Nagar',
    'Shalbari',
    'Dabgram',
    'Bagdogra',
    'Sukna',
    'Kadamtala',
    'Fulbari',
  ],
  deliveryVerified: env.deliveryVerified,

  /**
   * Real customer quotes only. Leave empty rather than inventing testimonials.
   * The reviews section links to Google reviews when this list is empty.
   */
  testimonials: [] as Testimonial[],

  /** Trading name of the Puja Samagri counter ("Vikash Store"), confirmed by the owner.
   *  Empty means no second business name is shown anywhere. */
  pujaCounterName: env.pujaCounterName,

  founded: undefined as string | undefined,
  contactEmail: env.contactEmail,
  social: {
    facebook: '',
    instagram: '',
  },
} as const;

export type Site = typeof site;

export function fullAddress(): string {
  const a = site.address;
  return `${a.streetAddress}, ${a.locality}, ${a.city}, ${a.region} ${a.postalCode}, ${a.countryName}`;
}
