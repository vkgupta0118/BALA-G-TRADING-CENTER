import { type FormEvent, useMemo, useState } from 'react';
import { CallLink, DirectionsLink, WhatsAppLink } from '@/components/ConversionLinks';
import {
  AlertIcon,
  ClockIcon,
  InfoIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/icons';
import { HoursList } from '@/components/LocationSection';
import { PageHeader } from '@/components/PageHeader';
import { env, formatE164ForDisplay } from '@/config/env';
import { fullAddress, site } from '@/config/site';
import { useI18n } from '@/i18n';
import { track } from '@/lib/analytics';
import { normalisePhone } from '@/lib/quote';
import { openWhatsApp, whatsappLink } from '@/lib/whatsapp';

export function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const text = useMemo(() => {
    const lines = [t('msg.contact').replace('{business}', site.name), '', message.trim()];
    if (name.trim()) lines.push('', `${t('msg.name')}: ${name.trim()}`);
    const p = normalisePhone(phone);
    if (p) lines.push(`${t('msg.phone')}: +${p}`);
    lines.push('', t('msg.footer'));
    return lines.join('\n');
  }, [message, name, phone, t]);
  const link = whatsappLink(text);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError(t('contact.err.message'));
      document.getElementById('message')?.focus();
      return;
    }
    setError('');
    track('whatsapp_click', { source: 'contact_form' });
    if (link.configured) {
      openWhatsApp(link.href);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`${site.address.locality}, ${site.address.city}`}
        title={t('contact.title')}
        lead={t('contact.subtitle')}
      />

      <section className="section" aria-label={t('nav.contact')}>
        <div className="container">
          <div className="grid grid-3">
            <article className="contact-card">
              <div className="card-icon">
                <PhoneIcon />
              </div>
              <h3>{t('contact.callTitle')}</h3>
              {env.phoneE164 ? (
                <p className="contact-value">{formatE164ForDisplay(env.phoneE164)}</p>
              ) : (
                <p className="muted">{t('config.phoneMissing')}</p>
              )}
              <CallLink className="btn btn-primary" source="contact_card" />
            </article>
            <article className="contact-card">
              <div className="card-icon">
                <WhatsAppIcon />
              </div>
              <h3>{t('contact.whatsappTitle')}</h3>
              {env.whatsappE164 ? (
                <p className="contact-value">{formatE164ForDisplay(env.whatsappE164)}</p>
              ) : (
                <p className="muted">{t('config.whatsappMissing')}</p>
              )}
              <WhatsAppLink source="contact_card" />
            </article>
            <article className="contact-card">
              <div className="card-icon">
                <MapPinIcon />
              </div>
              <h3>{t('contact.visitTitle')}</h3>
              <address style={{ fontStyle: 'normal' }} className="muted">
                {fullAddress()}
              </address>
              <DirectionsLink className="btn btn-primary" source="contact_card" />
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="hours-title">
        <div className="container">
          <div className="location-grid">
            <div className="card">
              <div className="card-icon">
                <ClockIcon />
              </div>
              <h3 id="hours-title">{t('location.hoursLabel')}</h3>
              <HoursList />
            </div>

            <form
              className="form-panel"
              onSubmit={onSubmit}
              noValidate
              data-testid="contact-form"
              aria-labelledby="enquiry-title"
            >
              <h3 id="enquiry-title">{t('contact.formTitle')}</h3>
              <p className="notice">
                <InfoIcon />
                <span>{t('contact.formHelp')}</span>
              </p>
              <div className="form-row form-row-2">
                <div className="field">
                  <label htmlFor="contact-name">{t('quote.name')}</label>
                  <input
                    id="contact-name"
                    className="input"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-phone">{t('quote.phone')}</label>
                  <input
                    id="contact-phone"
                    className="input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="message">{t('contact.message')}</label>
                <textarea
                  id="message"
                  className="textarea"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  maxLength={600}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'message-error' : undefined}
                  data-testid="contact-message"
                />
                {error ? (
                  <p className="field-error" id="message-error" role="alert">
                    <AlertIcon />
                    {error}
                  </p>
                ) : null}
              </div>
              {link.configured ? (
                <button
                  type="submit"
                  className="btn btn-whatsapp btn-lg"
                  data-testid="contact-submit"
                >
                  <WhatsAppIcon />
                  {t('contact.send')}
                </button>
              ) : (
                <p className="notice notice-warn">
                  <AlertIcon />
                  <span>
                    <strong>{t('config.whatsappMissing')}.</strong>{' '}
                    {t('config.whatsappMissingHelp')}
                  </span>
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
