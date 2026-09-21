import type { GeneratedImageSlug } from './images.generated';

/**
 * Product categories offered by the shop. Deliberately no prices, stock levels
 * or SKU lists – those change daily and are quoted over WhatsApp.
 */

export type UnitId =
  | 'sets'
  | 'items'
  | 'bags'
  | 'pieces'
  | 'thousand_pieces'
  | 'kg'
  | 'quintal'
  | 'tonne'
  | 'cft'
  | 'trolley'
  | 'units'
  | 'other';

export interface UnitOption {
  id: UnitId;
  /** English label; Bengali label lives in i18n */
  label: string;
}

export interface ProductCategory {
  id: 'cement' | 'bricks' | 'tmt' | 'hardware' | 'materials' | 'puja';
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  /** Typical uses – marketing copy, not inventory claims */
  uses: string[];
  /** What the customer should tell us for an accurate quote */
  askFor: string[];
  units: UnitOption[];
  defaultUnit: UnitId;
  /** schema.org category string */
  schemaCategory: string;
  icon: 'cement' | 'bricks' | 'steel' | 'hardware' | 'materials' | 'puja';
  /** Slug in public/images for this category's own photograph, when one exists. */
  image?: GeneratedImageSlug;
  /** Alt text for that photograph – describes what is actually in the frame. */
  imageAlt?: string;
  /** True when the owner has not supplied a photograph of this category yet.
   *  The card then shows a clearly-marked "photo coming" panel rather than a stock image. */
  photoPending?: boolean;
  /** Common specifications customers are asked for, shown under the card. */
  typicalSpecs?: string;
}

export const UNIT_LABELS: Record<UnitId, string> = {
  sets: 'sets',
  items: 'items',
  bags: 'bags',
  pieces: 'pieces',
  thousand_pieces: 'thousand pieces',
  kg: 'kg',
  quintal: 'quintal',
  tonne: 'tonne',
  cft: 'cubic feet (cft)',
  trolley: 'trolley / truck load',
  units: 'units',
  other: 'other (describe in notes)',
};

export const productCategories: ProductCategory[] = [
  {
    id: 'cement',
    slug: 'cement',
    name: 'Cement',
    shortDescription: 'OPC and PPC grades for foundations, slabs, plaster and finishing work.',
    description:
      'Bagged cement for every stage of construction – from footings and RCC slabs to plastering and finishing. Tell us the grade and quantity you need and we will confirm today’s price and availability on WhatsApp.',
    uses: [
      'Foundations & RCC',
      'Brickwork & plaster',
      'Flooring & finishing',
      'Repairs & renovation',
    ],
    askFor: [
      'Grade (OPC 43/53, PPC or as specified by your engineer)',
      'Number of bags',
      'Delivery location',
    ],
    units: [
      { id: 'bags', label: 'bags' },
      { id: 'other', label: 'other' },
    ],
    defaultUnit: 'bags',
    schemaCategory: 'Building Materials > Cement',
    icon: 'cement',
    image: 'cement-stock',
    imageAlt: 'Bags of Dalmia cement stacked in the godown at Balajee Trading Centre',
    typicalSpecs: 'OPC 43 · OPC 53 · PPC — sold by the bag',
  },
  {
    id: 'bricks',
    slug: 'bricks',
    name: 'Bricks',
    shortDescription: 'Red clay bricks and blocks for walls, boundary work and structures.',
    description:
      'Bricks and blocks for load-bearing walls, partitions, boundary walls and paving. Quantities are usually quoted per thousand pieces; smaller lots are welcome for repairs.',
    uses: ['Walls & partitions', 'Boundary walls', 'Foundations', 'Repair jobs'],
    askFor: [
      'Type (red brick, fly-ash brick, block – as required)',
      'Quantity in pieces or thousands',
      'Delivery location',
    ],
    units: [
      { id: 'pieces', label: 'pieces' },
      { id: 'thousand_pieces', label: 'thousand pieces' },
      { id: 'other', label: 'other' },
    ],
    defaultUnit: 'thousand_pieces',
    schemaCategory: 'Building Materials > Bricks & Blocks',
    icon: 'bricks',
    image: 'bricks-stack',
    imageAlt: 'Stack of MRB-stamped red clay bricks in the yard at Balajee Trading Centre',
    typicalSpecs: 'Red clay brick — quoted per 1,000 pieces or by the piece',
  },
  {
    id: 'tmt',
    slug: 'tmt-rods-steel',
    name: 'TMT Rods & Steel',
    shortDescription: 'TMT reinforcement bars in common diameters, plus binding wire.',
    description:
      'TMT reinforcement bars for columns, beams, slabs and footings, along with binding wire and related steel. Share the diameters and weight from your bar-bending schedule and we will quote the day’s rate.',
    uses: ['Columns & beams', 'Slabs & footings', 'Lintels & chajjas', 'Extensions'],
    askFor: [
      'Diameter(s) – e.g. 8 mm, 10 mm, 12 mm, 16 mm',
      'Weight in kg / quintal / tonne, or number of pieces',
      'Delivery location',
    ],
    units: [
      { id: 'kg', label: 'kg' },
      { id: 'quintal', label: 'quintal' },
      { id: 'tonne', label: 'tonne' },
      { id: 'pieces', label: 'pieces' },
    ],
    defaultUnit: 'kg',
    schemaCategory: 'Building Materials > Steel & Reinforcement',
    icon: 'steel',
    photoPending: true,
    typicalSpecs: '8 · 10 · 12 · 16 · 20 mm — by kg, quintal or tonne',
  },
  {
    id: 'hardware',
    slug: 'hardware',
    name: 'Hardware',
    shortDescription: 'Everyday construction hardware, tools and fittings for site work.',
    description:
      'Nails, binding wire, fasteners, tools, plumbing and general construction hardware for masons, plumbers and homeowners. Send us your list and we will confirm what is in stock.',
    uses: ['Masonry tools', 'Fasteners & fittings', 'Site consumables', 'Home repairs'],
    askFor: ['Item names and sizes', 'Quantities', 'Brand preference, if any'],
    units: [
      { id: 'units', label: 'units' },
      { id: 'kg', label: 'kg' },
      { id: 'other', label: 'other' },
    ],
    defaultUnit: 'units',
    schemaCategory: 'Hardware',
    icon: 'hardware',
    photoPending: true,
    typicalSpecs: 'Nails, binding wire, fasteners, tools, plumbing fittings',
  },
  {
    id: 'materials',
    slug: 'building-materials',
    name: 'Other Building Materials',
    shortDescription: 'Sand, stone chips, and other site materials – ask us what you need.',
    description:
      'Need something not listed – sand, stone chips, or another site material? Describe it in the quote builder and we will tell you whether we can arrange it and at what price.',
    uses: ['Concrete & plaster sand', 'Stone aggregate', 'Site consumables', 'Special requests'],
    askFor: ['Material name and grade', 'Quantity and unit', 'When you need it'],
    units: [
      { id: 'cft', label: 'cft' },
      { id: 'trolley', label: 'trolley / truck' },
      { id: 'kg', label: 'kg' },
      { id: 'other', label: 'other' },
    ],
    defaultUnit: 'cft',
    schemaCategory: 'Building Materials',
    icon: 'materials',
    photoPending: true,
    typicalSpecs: 'Sand, stone chips and site materials — by cft or trolley',
  },
  {
    id: 'puja',
    slug: 'puja-samagri',
    name: 'Puja Samagri / Puja Materials',
    shortDescription: 'Puja Samagri available here, at the counter alongside building materials.',
    description:
      'Puja Samagri available here. Tell us the items you need, how many sets, and which puja or festival they are for, and we will confirm what we can give you and the price on WhatsApp.',
    uses: ['Household puja', 'Festival days', 'Housewarming', 'Shop opening'],
    askFor: [
      'The list of items you need',
      'How many sets or pieces of each',
      'Which puja or festival, and the date you need them by',
    ],
    units: [
      { id: 'sets', label: 'sets' },
      { id: 'items', label: 'items' },
      { id: 'pieces', label: 'pieces' },
      { id: 'other', label: 'other' },
    ],
    defaultUnit: 'sets',
    schemaCategory: 'Religious Items',
    icon: 'puja',
    photoPending: true,
  },
];

/** Categories that use the Puja details step (festival + required date) in the quote builder. */
export const PUJA_CATEGORY_ID = 'puja';

export function hasPujaLine(categoryIds: string[]): boolean {
  return categoryIds.includes(PUJA_CATEGORY_ID);
}

export function findCategory(id: string): ProductCategory | undefined {
  return productCategories.find((c) => c.id === id || c.slug === id);
}
