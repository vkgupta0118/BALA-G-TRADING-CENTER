import { findCategory, UNIT_LABELS, type UnitId } from '@/config/products';

/**
 * Quote builder domain logic: types, validation and the WhatsApp message.
 * Pure functions – unit-tested in tests/unit/quote.test.ts.
 */

export interface QuoteLine {
  id: string;
  categoryId: string;
  /** Free-text specification, e.g. "12 mm", "OPC 53", "red brick" */
  spec: string;
  quantity: string;
  unit: UnitId;
}

export interface QuoteForm {
  lines: QuoteLine[];
  deliveryArea: string;
  deliveryAreaOther: string;
  name: string;
  phone: string;
  notes: string;
}

export type QuoteErrors = Partial<
  Record<'lines' | 'deliveryArea' | 'name' | 'phone' | 'notes', string>
> & {
  lineErrors?: Record<string, { quantity?: string; spec?: string }>;
};

export type LabelSet = {
  errLines: string;
  errLineQuantity: string;
  errDeliveryArea: string;
  errName: string;
  errPhone: string;
  errNotes: string;
};

export const OTHER_AREA = '__other__';
export const MAX_NOTES = 500;
export const MAX_LINES = 12;

let seq = 0;
export function newLine(categoryId: string): QuoteLine {
  const cat = findCategory(categoryId);
  seq += 1;
  return {
    id: `line-${Date.now().toString(36)}-${seq}`,
    categoryId,
    spec: '',
    quantity: '',
    unit: cat?.defaultUnit ?? 'units',
  };
}

export function emptyQuote(): QuoteForm {
  return { lines: [], deliveryArea: '', deliveryAreaOther: '', name: '', phone: '', notes: '' };
}

/** Accepts Indian mobiles (10 digits starting 6–9) with optional +91/0 prefix, or any 8–15 digit international number. */
export function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  let d = digits.startsWith('+') ? digits.slice(1) : digits;
  if (d.startsWith('0') && d.length === 11) d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) return `91${d}`;
  if (d.startsWith('91') && d.length === 12 && /^91[6-9]/.test(d)) return d;
  if (/^\d{8,15}$/.test(d)) return d;
  return '';
}

export function isValidQuantity(q: string): boolean {
  const n = Number(q.replace(/,/g, ''));
  return q.trim() !== '' && Number.isFinite(n) && n > 0 && n <= 1_000_000;
}

export function validateQuote(form: QuoteForm, labels: LabelSet): QuoteErrors {
  const errors: QuoteErrors = {};
  if (form.lines.length === 0) errors.lines = labels.errLines;

  const lineErrors: QuoteErrors['lineErrors'] = {};
  for (const line of form.lines) {
    if (!isValidQuantity(line.quantity)) lineErrors[line.id] = { quantity: labels.errLineQuantity };
  }
  if (Object.keys(lineErrors).length) errors.lineErrors = lineErrors;

  const area = form.deliveryArea === OTHER_AREA ? form.deliveryAreaOther : form.deliveryArea;
  if (!area.trim()) errors.deliveryArea = labels.errDeliveryArea;

  if (form.name.trim().length < 2) errors.name = labels.errName;
  if (!normalisePhone(form.phone)) errors.phone = labels.errPhone;
  if (form.notes.length > MAX_NOTES) errors.notes = labels.errNotes;
  return errors;
}

export function hasErrors(errors: QuoteErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function resolvedArea(form: QuoteForm): string {
  return (form.deliveryArea === OTHER_AREA ? form.deliveryAreaOther : form.deliveryArea).trim();
}

export interface MessageLabels {
  greeting: string; // "Hello {business}, I'd like a quote for:"
  materials: string;
  deliveryArea: string;
  name: string;
  phone: string;
  notes: string;
  footer: string;
}

export function formatLine(line: QuoteLine): string {
  const cat = findCategory(line.categoryId);
  const name = cat?.name ?? line.categoryId;
  const spec = line.spec.trim() ? ` (${line.spec.trim()})` : '';
  const unit = UNIT_LABELS[line.unit] ?? line.unit;
  const qty = line.quantity.trim().replace(/,/g, '');
  return `• ${name}${spec}: ${qty} ${unit}`;
}

/** Builds the plain-text WhatsApp message. Keeps under ~1,500 chars so the link stays reliable. */
export function buildQuoteMessage(
  form: QuoteForm,
  businessName: string,
  labels: MessageLabels,
): string {
  const parts: string[] = [];
  parts.push(labels.greeting.replace('{business}', businessName));
  parts.push('');
  parts.push(`${labels.materials}:`);
  for (const line of form.lines) parts.push(formatLine(line));
  parts.push('');
  parts.push(`${labels.deliveryArea}: ${resolvedArea(form)}`);
  parts.push(`${labels.name}: ${form.name.trim()}`);
  parts.push(`${labels.phone}: +${normalisePhone(form.phone)}`);
  if (form.notes.trim()) parts.push(`${labels.notes}: ${form.notes.trim().slice(0, MAX_NOTES)}`);
  parts.push('');
  parts.push(labels.footer);
  return parts.join('\n');
}

/** Short message for generic "WhatsApp us" buttons (no personal data). */
export function buildGenericMessage(
  businessName: string,
  template: string,
  context?: string,
): string {
  const base = template.replace('{business}', businessName);
  return context ? `${base}\n${context}` : base;
}
