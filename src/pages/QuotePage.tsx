import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WhatsAppLink } from '@/components/ConversionLinks';
import {
  AlertIcon,
  CheckIcon,
  CopyIcon,
  categoryIcons,
  InfoIcon,
  PlusIcon,
  TrashIcon,
  WhatsAppIcon,
} from '@/components/icons';
import { PageHeader } from '@/components/PageHeader';
import { findCategory, productCategories, UNIT_LABELS } from '@/config/products';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { track } from '@/lib/analytics';
import {
  buildQuoteMessage,
  emptyQuote,
  hasErrors,
  MAX_LINES,
  MAX_NOTES,
  newLine,
  OTHER_AREA,
  type QuoteErrors,
  type QuoteForm,
  type QuoteLine,
  validateQuote,
} from '@/lib/quote';
import { openWhatsApp, whatsappLink } from '@/lib/whatsapp';

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, []);
  return { copied, copy };
}

export function QuotePage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState<QuoteForm>(emptyQuote);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const { copied, copy } = useCopy();

  const markStarted = useCallback(() => {
    if (!started) {
      setStarted(true);
      track('quote_started', {});
    }
  }, [started]);

  // Pre-select a category from ?add=<id> (e.g. links from product cards).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const add = params.get('add');
    if (add && findCategory(add)) {
      setForm((f) => (f.lines.length ? f : { ...f, lines: [newLine(add)] }));
    }
  }, []);

  const addLine = (categoryId: string) => {
    markStarted();
    setForm((f) =>
      f.lines.length >= MAX_LINES ? f : { ...f, lines: [...f.lines, newLine(categoryId)] },
    );
    setErrors((e) => {
      const { lines: _drop, ...rest } = e;
      return rest;
    });
    // Move focus to the new line's quantity field once rendered.
    window.requestAnimationFrame(() => {
      const inputs = linesRef.current?.querySelectorAll<HTMLInputElement>(
        'input[data-field="quantity"]',
      );
      inputs?.[inputs.length - 1]?.focus();
    });
  };

  const updateLine = (id: string, patch: Partial<QuoteLine>) => {
    setForm((f) => ({ ...f, lines: f.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  };

  const removeLine = (id: string) => {
    setForm((f) => ({ ...f, lines: f.lines.filter((l) => l.id !== id) }));
  };

  const update = <K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) => {
    markStarted();
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as keyof QuoteErrors];
        return next;
      });
    }
  };

  const labels = useMemo(
    () => ({
      errLines: t('quote.err.lines'),
      errLineQuantity: t('quote.err.quantity'),
      errDeliveryArea: t('quote.err.area'),
      errName: t('quote.err.name'),
      errPhone: t('quote.err.phone'),
      errNotes: t('quote.err.notes'),
    }),
    [t],
  );

  const message = useMemo(
    () =>
      buildQuoteMessage(form, site.name, {
        greeting: t('msg.greeting'),
        materials: t('msg.materials'),
        deliveryArea: t('msg.deliveryArea'),
        name: t('msg.name'),
        phone: t('msg.phone'),
        notes: t('msg.notes'),
        footer: t('msg.footer'),
      }),
    [form, t],
  );
  const link = whatsappLink(message);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateQuote(form, labels);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      setSubmitted(false);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitted(true);
    track('quote_submitted', { lines: form.lines.length, lang });
    if (link.configured) {
      openWhatsApp(link.href);
    }
  };

  const errorList = useMemo(() => {
    const list: Array<{ id: string; text: string }> = [];
    if (errors.lines) list.push({ id: 'category-picker', text: errors.lines });
    if (errors.lineErrors) {
      for (const [lineId, err] of Object.entries(errors.lineErrors)) {
        if (err.quantity) list.push({ id: `${lineId}-quantity`, text: err.quantity });
      }
    }
    if (errors.deliveryArea) list.push({ id: 'deliveryArea', text: errors.deliveryArea });
    if (errors.name) list.push({ id: 'name', text: errors.name });
    if (errors.phone) list.push({ id: 'phone', text: errors.phone });
    if (errors.notes) list.push({ id: 'notes', text: errors.notes });
    return list;
  }, [errors]);

  const notesLeft = MAX_NOTES - form.notes.length;

  return (
    <>
      <PageHeader eyebrow={t('nav.quote')} title={t('quote.title')} lead={t('quote.subtitle')} />
      <section className="section" aria-label={t('quote.title')}>
        <div className="container" style={{ maxWidth: '56rem' }}>
          <form className="form-panel" onSubmit={onSubmit} noValidate data-testid="quote-form">
            {errorList.length > 0 ? (
              <div
                className="error-summary"
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                data-testid="error-summary"
              >
                <h3>{t('quote.errorSummary')}</h3>
                <ul>
                  {errorList.map((err) => (
                    <li key={err.id}>
                      <a href={`#${err.id}`}>{err.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Step 1 – Materials */}
            <fieldset
              style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 'var(--space-4)' }}
            >
              <legend className="step-title">
                <span className="step-num" aria-hidden="true">
                  1
                </span>
                {t('quote.step1')}
              </legend>
              <p className="muted small" id="category-picker-help">
                {t('quote.categoryPrompt')}
              </p>
              <div
                className="category-picker"
                id="category-picker"
                aria-describedby="category-picker-help"
              >
                {productCategories.map((c) => {
                  const Icon = categoryIcons[c.icon];
                  return (
                    <button
                      type="button"
                      className="category-btn"
                      key={c.id}
                      onClick={() => addLine(c.id)}
                      data-testid={`pick-${c.id}`}
                      disabled={form.lines.length >= MAX_LINES}
                    >
                      <Icon />
                      <span>{c.name}</span>
                      <span>
                        <PlusIcon style={{ width: '0.9em', height: '0.9em' }} /> {t('quote.add')}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="quote-lines" ref={linesRef} aria-live="polite">
                {form.lines.length === 0 ? (
                  <p className="empty-state" data-testid="no-lines">
                    {t('quote.noLines')}
                  </p>
                ) : (
                  <p className="visually-hidden">
                    {t('quote.linesSummary', { n: form.lines.length })}
                  </p>
                )}
                {form.lines.map((line, index) => {
                  const cat = findCategory(line.categoryId);
                  const Icon = categoryIcons[cat?.icon ?? 'materials'];
                  const qtyError = errors.lineErrors?.[line.id]?.quantity;
                  return (
                    <div className="quote-line" key={line.id} data-testid="quote-line">
                      <div className="quote-line-head">
                        <h4>
                          <Icon />
                          {index + 1}. {cat?.name ?? line.categoryId}
                        </h4>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => removeLine(line.id)}
                          aria-label={t('quote.removeLine', { name: cat?.name ?? line.categoryId })}
                          data-testid="remove-line"
                        >
                          <TrashIcon />
                          {t('quote.remove')}
                        </button>
                      </div>
                      <div className="quote-line-fields">
                        <div className="field">
                          <label htmlFor={`${line.id}-spec`}>{t('quote.spec')}</label>
                          <input
                            id={`${line.id}-spec`}
                            className="input"
                            value={line.spec}
                            placeholder={t('quote.specHint')}
                            onChange={(e) => updateLine(line.id, { spec: e.target.value })}
                            maxLength={80}
                            data-field="spec"
                          />
                        </div>
                        <div className="field">
                          <label htmlFor={`${line.id}-quantity`}>{t('quote.quantity')}</label>
                          <input
                            id={`${line.id}-quantity`}
                            className="input"
                            inputMode="decimal"
                            value={line.quantity}
                            onChange={(e) => {
                              updateLine(line.id, { quantity: e.target.value });
                              if (qtyError) {
                                setErrors((prev) => {
                                  const remaining = { ...prev.lineErrors };
                                  delete remaining[line.id];
                                  const { lineErrors: _drop, ...rest } = prev;
                                  return Object.keys(remaining).length
                                    ? { ...rest, lineErrors: remaining }
                                    : rest;
                                });
                              }
                            }}
                            aria-invalid={qtyError ? true : undefined}
                            aria-describedby={qtyError ? `${line.id}-quantity-error` : undefined}
                            required
                            data-field="quantity"
                            data-testid="quantity-input"
                          />
                          {qtyError ? (
                            <p className="field-error" id={`${line.id}-quantity-error`}>
                              <AlertIcon />
                              {qtyError}
                            </p>
                          ) : null}
                        </div>
                        <div className="field">
                          <label htmlFor={`${line.id}-unit`}>{t('quote.unit')}</label>
                          <select
                            id={`${line.id}-unit`}
                            className="select"
                            value={line.unit}
                            onChange={(e) =>
                              updateLine(line.id, { unit: e.target.value as QuoteLine['unit'] })
                            }
                            data-field="unit"
                          >
                            {(cat?.units ?? []).map((u) => (
                              <option key={u.id} value={u.id}>
                                {UNIT_LABELS[u.id]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 2 – Delivery area */}
            <fieldset
              style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 'var(--space-4)' }}
            >
              <legend className="step-title">
                <span className="step-num" aria-hidden="true">
                  2
                </span>
                {t('quote.step2')}
              </legend>
              <div className="form-row form-row-2">
                <div className="field">
                  <label htmlFor="deliveryArea">{t('quote.deliveryArea')}</label>
                  <select
                    id="deliveryArea"
                    className="select"
                    value={form.deliveryArea}
                    onChange={(e) => update('deliveryArea', e.target.value)}
                    aria-invalid={errors.deliveryArea ? true : undefined}
                    aria-describedby={errors.deliveryArea ? 'deliveryArea-error' : undefined}
                    required
                    data-testid="delivery-area"
                  >
                    <option value="">{t('quote.selectArea')}</option>
                    {site.serviceAreas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                    <option value={OTHER_AREA}>{t('quote.otherArea')}</option>
                  </select>
                  {errors.deliveryArea ? (
                    <p className="field-error" id="deliveryArea-error">
                      <AlertIcon />
                      {errors.deliveryArea}
                    </p>
                  ) : null}
                </div>
                {form.deliveryArea === OTHER_AREA ? (
                  <div className="field">
                    <label htmlFor="deliveryAreaOther">{t('quote.otherAreaLabel')}</label>
                    <input
                      id="deliveryAreaOther"
                      className="input"
                      value={form.deliveryAreaOther}
                      onChange={(e) => update('deliveryAreaOther', e.target.value)}
                      maxLength={80}
                      data-testid="delivery-area-other"
                    />
                  </div>
                ) : null}
              </div>
            </fieldset>

            {/* Step 3 – Contact details */}
            <fieldset
              style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 'var(--space-4)' }}
            >
              <legend className="step-title">
                <span className="step-num" aria-hidden="true">
                  3
                </span>
                {t('quote.step3')}
              </legend>
              <div className="form-row form-row-2">
                <div className="field">
                  <label htmlFor="name">{t('quote.name')}</label>
                  <input
                    id="name"
                    className="input"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    required
                    maxLength={80}
                    data-testid="name-input"
                  />
                  {errors.name ? (
                    <p className="field-error" id="name-error">
                      <AlertIcon />
                      {errors.name}
                    </p>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor="phone">{t('quote.phone')}</label>
                  <input
                    id="phone"
                    className="input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? 'phone-error phone-hint' : 'phone-hint'}
                    required
                    maxLength={20}
                    data-testid="phone-input"
                  />
                  <span className="hint" id="phone-hint">
                    {t('quote.phoneHint')}
                  </span>
                  {errors.phone ? (
                    <p className="field-error" id="phone-error">
                      <AlertIcon />
                      {errors.phone}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label htmlFor="notes">{t('quote.notes')}</label>
                <textarea
                  id="notes"
                  className="textarea"
                  value={form.notes}
                  placeholder={t('quote.notesHint')}
                  onChange={(e) => update('notes', e.target.value)}
                  maxLength={MAX_NOTES + 50}
                  aria-invalid={errors.notes ? true : undefined}
                  aria-describedby={errors.notes ? 'notes-error notes-hint' : 'notes-hint'}
                  data-testid="notes-input"
                />
                <span className="hint" id="notes-hint">
                  {t('quote.charsLeft', { n: Math.max(0, notesLeft) })}
                </span>
                {errors.notes ? (
                  <p className="field-error" id="notes-error">
                    <AlertIcon />
                    {errors.notes}
                  </p>
                ) : null}
              </div>
              <p className="notice">
                <InfoIcon />
                <span>{t('quote.privacy')}</span>
              </p>
            </fieldset>

            {/* Preview + submit */}
            {form.lines.length > 0 ? (
              <div className="message-preview">
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                  }}
                >
                  {t('quote.preview')}
                </h3>
                <pre data-testid="message-preview">{message}</pre>
              </div>
            ) : null}

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {link.configured ? (
                <button
                  type="submit"
                  className="btn btn-whatsapp btn-lg btn-block"
                  data-testid="submit-quote"
                >
                  <WhatsAppIcon />
                  {t('quote.submit')}
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    data-testid="submit-quote"
                  >
                    {t('quote.preview')}
                  </button>
                  <p className="notice notice-warn" data-testid="quote-unconfigured">
                    <AlertIcon />
                    <span>
                      <strong>{t('config.whatsappMissing')}.</strong>{' '}
                      {t('config.whatsappMissingHelp')}
                    </span>
                  </p>
                </>
              )}
              <p className="muted small">{t('quote.submitHelp')}</p>

              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => copy(message)}
                  aria-describedby="copy-help"
                  data-testid="copy-message"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? t('cta.copied') : t('cta.copyMessage')}
                </button>
                {submitted && link.configured ? (
                  <WhatsAppLink
                    className="btn btn-ghost"
                    source="quote_after_submit"
                    message={message}
                    data-testid="quote-whatsapp-link"
                  >
                    {t('cta.openWhatsApp')}
                  </WhatsAppLink>
                ) : null}
              </div>
              <p className="hint" id="copy-help">
                {t('quote.copyHelp')}
              </p>
              <p className="visually-hidden" aria-live="polite">
                {copied ? t('cta.copied') : ''}
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
