/**
 * Product categories offered by the shop. Deliberately no prices, stock levels
 * or SKU lists – those change daily and are quoted over WhatsApp.
 */

export type UnitId =
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
  id: 'cement' | 'bricks' | 'tmt' | 'hardware' | 'materials';
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
  icon: 'cement' | 'bricks' | 'steel' | 'hardware' | 'materials';
}

export const UNIT_LABELS: Record<UnitId, string> = {
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
  },
];

export function findCategory(id: string): ProductCategory | undefined {
  return productCategories.find((c) => c.id === id || c.slug === id);
}
