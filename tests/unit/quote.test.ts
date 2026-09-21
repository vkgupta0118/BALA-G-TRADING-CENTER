import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatE164ForDisplay, normaliseE164, stripBase, withBase } from '@/config/env';
import {
  buildGenericMessage,
  buildQuoteMessage,
  emptyQuote,
  hasErrors,
  isValidQuantity,
  MAX_NOTES,
  normalisePhone,
  OTHER_AREA,
  type QuoteForm,
  validateQuote,
} from '@/lib/quote';
import { buildWhatsAppHref, whatsappLink } from '@/lib/whatsapp';

const labels = {
  errLines: 'lines',
  errLineQuantity: 'qty',
  errDeliveryArea: 'area',
  errName: 'name',
  errPhone: 'phone',
  errNotes: 'notes',
};

const msgLabels = {
  greeting: 'Hello {business}, quote please:',
  materials: 'Materials',
  deliveryArea: 'Delivery area',
  name: 'Name',
  phone: 'Phone',
  notes: 'Notes',
  footer: 'Sent from the website.',
};

function validForm(): QuoteForm {
  return {
    lines: [
      { id: 'l1', categoryId: 'cement', spec: 'OPC 53', quantity: '50', unit: 'bags' },
      { id: 'l2', categoryId: 'tmt', spec: '12 mm', quantity: '500', unit: 'kg' },
    ],
    deliveryArea: 'Champasari',
    deliveryAreaOther: '',
    name: 'Rahul Das',
    phone: '98765 43210',
    notes: 'Need by Saturday',
  };
}

describe('E.164 handling', () => {
  it('normalises formatted numbers to digits only', () => {
    assert.equal(normaliseE164('+91 93391 88629'), '919339188629');
    assert.equal(normaliseE164('919339188629'), '919339188629');
  });
  it('rejects invalid values instead of producing a broken link', () => {
    assert.equal(normaliseE164(''), '');
    assert.equal(normaliseE164('0123'), '');
    assert.equal(normaliseE164('not-a-number'), '');
  });
  it('formats Indian numbers for display', () => {
    assert.equal(formatE164ForDisplay('919339188629'), '+91 93391 88629');
    assert.equal(formatE164ForDisplay('447700900123'), '+447700900123');
  });
});

describe('WhatsApp link builder', () => {
  it('builds a valid wa.me URL with encoded text', () => {
    const href = buildWhatsAppHref('919999999999', 'Hello & welcome\nLine 2');
    assert.equal(href, 'https://wa.me/919999999999?text=Hello%20%26%20welcome%0ALine%202');
  });
  it('reports the unconfigured state when no number is set (no broken href)', () => {
    const link = whatsappLink('Hi', '');
    assert.equal(link.configured, false);
    assert.equal(link.href, '');
    assert.equal(link.message, 'Hi');
  });
  it('uses the configured number from the environment by default', () => {
    const link = whatsappLink('Hi');
    assert.equal(link.configured, true);
    assert.ok(link.href.startsWith('https://wa.me/919999999999?text='));
  });
});

describe('Phone normalisation', () => {
  it('accepts 10-digit Indian mobiles with or without prefixes', () => {
    assert.equal(normalisePhone('9876543210'), '919876543210');
    assert.equal(normalisePhone('+91 98765 43210'), '919876543210');
    assert.equal(normalisePhone('09876543210'), '919876543210');
    assert.equal(normalisePhone('91-9876543210'), '919876543210');
  });
  it('rejects too-short or nonsense input', () => {
    assert.equal(normalisePhone('12345'), '');
    assert.equal(normalisePhone('abc'), '');
    assert.equal(normalisePhone(''), '');
  });
});

describe('Quote validation', () => {
  it('passes a complete form', () => {
    const errors = validateQuote(validForm(), labels);
    assert.equal(hasErrors(errors), false);
  });
  it('requires at least one material', () => {
    const errors = validateQuote({ ...validForm(), lines: [] }, labels);
    assert.equal(errors.lines, 'lines');
  });
  it('flags invalid quantities per line', () => {
    const form = validForm();
    form.lines = form.lines.map((line, i) => ({ ...line, quantity: i === 0 ? '0' : 'abc' }));
    const errors = validateQuote(form, labels);
    assert.deepEqual(errors.lineErrors, { l1: { quantity: 'qty' }, l2: { quantity: 'qty' } });
    assert.equal(isValidQuantity('1,000'), true);
    assert.equal(isValidQuantity('-5'), false);
  });
  it('requires a delivery area, using the free-text field for "other"', () => {
    const missing = validateQuote({ ...validForm(), deliveryArea: '' }, labels);
    assert.equal(missing.deliveryArea, 'area');
    const otherBlank = validateQuote(
      { ...validForm(), deliveryArea: OTHER_AREA, deliveryAreaOther: '   ' },
      labels,
    );
    assert.equal(otherBlank.deliveryArea, 'area');
    const otherOk = validateQuote(
      { ...validForm(), deliveryArea: OTHER_AREA, deliveryAreaOther: 'Naxalbari' },
      labels,
    );
    assert.equal(otherOk.deliveryArea, undefined);
  });
  it('requires a name, a valid phone and notes under the limit', () => {
    const errors = validateQuote(
      { ...validForm(), name: 'A', phone: '123', notes: 'x'.repeat(MAX_NOTES + 1) },
      labels,
    );
    assert.equal(errors.name, 'name');
    assert.equal(errors.phone, 'phone');
    assert.equal(errors.notes, 'notes');
  });
  it('emptyQuote() is invalid', () => {
    assert.equal(hasErrors(validateQuote(emptyQuote(), labels)), true);
  });
});

describe('Quote message', () => {
  it('includes materials, quantities, delivery area and contact details', () => {
    const message = buildQuoteMessage(validForm(), 'Balajee Trading', msgLabels);
    assert.match(message, /^Hello Balajee Trading, quote please:/);
    assert.match(message, /• Cement \(OPC 53\): 50 bags/);
    assert.match(message, /• TMT Rods & Steel \(12 mm\): 500 kg/);
    assert.match(message, /Delivery area: Champasari/);
    assert.match(message, /Name: Rahul Das/);
    assert.match(message, /Phone: \+919876543210/);
    assert.match(message, /Notes: Need by Saturday/);
    assert.match(message, /Sent from the website\.$/);
  });
  it('uses the free-text area when "other" is chosen and omits empty notes', () => {
    const form = {
      ...validForm(),
      deliveryArea: OTHER_AREA,
      deliveryAreaOther: 'Naxalbari',
      notes: '',
    };
    const message = buildQuoteMessage(form, 'Balajee Trading', msgLabels);
    assert.match(message, /Delivery area: Naxalbari/);
    assert.doesNotMatch(message, /Notes:/);
  });
  it('produces a wa.me link that round-trips the message', () => {
    const message = buildQuoteMessage(validForm(), 'Balajee Trading', msgLabels);
    const { href } = whatsappLink(message);
    const url = new URL(href);
    assert.equal(url.hostname, 'wa.me');
    assert.equal(url.pathname, '/919999999999');
    assert.equal(url.searchParams.get('text'), message);
  });
  it('generic messages substitute the business name', () => {
    assert.equal(buildGenericMessage('Balajee', 'Hi {business}'), 'Hi Balajee');
    assert.equal(
      buildGenericMessage('Balajee', 'Hi {business}', 'Re: cement'),
      'Hi Balajee\nRe: cement',
    );
  });
});

describe('Base path (GitHub Pages sub-path hosting)', () => {
  it('prefixes internal links with the base path', () => {
    assert.equal(withBase('/'), '/REPO/');
    assert.equal(withBase('/quote'), '/REPO/quote');
    assert.equal(withBase('/quote?add=cement'), '/REPO/quote?add=cement');
    assert.equal(withBase('https://wa.me/1'), 'https://wa.me/1');
  });
  it('strips the base path from browser pathnames', () => {
    assert.equal(stripBase('/REPO'), '/');
    assert.equal(stripBase('/REPO/'), '/');
    assert.equal(stripBase('/REPO/products'), '/products');
    assert.equal(stripBase('/other'), '/other');
  });
});
