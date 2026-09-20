import type { ReactNode } from 'react';
import { env } from '@/config/env';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { type AnalyticsEvent, type EventParams, track } from '@/lib/analytics';
import { buildGenericMessage } from '@/lib/quote';
import { telHref, whatsappLink } from '@/lib/whatsapp';
import { AlertIcon, NavigationIcon, PhoneIcon, WhatsAppIcon } from './icons';

/**
 * The three conversion actions used everywhere. Each one:
 *  - reads its destination ONLY from config (no hard-coded numbers)
 *  - fires the matching analytics event
 *  - renders an honest "not configured" state instead of a broken link
 */

interface BaseProps {
  className?: string;
  /** Where on the page the CTA lives – recorded in analytics (no PII). */
  source: string;
  children?: ReactNode;
  showIcon?: boolean;
}

function onTracked(name: AnalyticsEvent, params: EventParams) {
  return () => track(name, params);
}

export function WhatsAppLink({
  className = 'btn btn-whatsapp',
  source,
  message,
  children,
  showIcon = true,
  ...rest
}: BaseProps & { message?: string; 'data-testid'?: string }) {
  const { t } = useI18n();
  const text = message ?? buildGenericMessage(site.name, t('msg.generic'));
  const link = whatsappLink(text);

  if (!link.configured) {
    return (
      <span
        className={`${className} btn-unconfigured`}
        role="note"
        title={t('config.whatsappMissingHelp')}
        data-testid={rest['data-testid'] ?? 'whatsapp-unconfigured'}
      >
        <AlertIcon />
        {t('config.whatsappMissing')}
      </span>
    );
  }

  return (
    <a
      href={link.href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTracked('whatsapp_click', { source })}
      data-testid={rest['data-testid'] ?? 'whatsapp-link'}
    >
      {showIcon ? <WhatsAppIcon /> : null}
      {children ?? t('cta.whatsappQuote')}
      <span className="visually-hidden"> {t('a11y.opensNewTab')}</span>
    </a>
  );
}

export function CallLink({
  className = 'btn btn-outline',
  source,
  children,
  showIcon = true,
}: BaseProps) {
  const { t } = useI18n();
  const href = telHref();
  if (!href) {
    return (
      <span className={`${className} btn-unconfigured`} role="note" data-testid="call-unconfigured">
        <AlertIcon />
        {t('config.phoneMissing')}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={className}
      onClick={onTracked('call_click', { source })}
      data-testid="call-link"
    >
      {showIcon ? <PhoneIcon /> : null}
      {children ?? t('cta.callNow')}
    </a>
  );
}

export function DirectionsLink({
  className = 'btn btn-outline',
  source,
  children,
  showIcon = true,
}: BaseProps) {
  const { t } = useI18n();
  return (
    <a
      href={env.mapsUrl}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTracked('directions_click', { source })}
      data-testid="directions-link"
    >
      {showIcon ? <NavigationIcon /> : null}
      {children ?? t('cta.directions')}
      <span className="visually-hidden"> {t('a11y.opensNewTab')}</span>
    </a>
  );
}
