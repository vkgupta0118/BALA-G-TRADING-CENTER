import { env } from '@/config/env';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { track } from '@/lib/analytics';
import { buildGenericMessage } from '@/lib/quote';
import { telHref, whatsappLink } from '@/lib/whatsapp';
import { AlertIcon, NavigationIcon, PhoneIcon, WhatsAppIcon } from './icons';

/** Mobile-only bottom bar: Call · WhatsApp quote · Directions (hidden ≥ 64em via CSS). */
export function StickyBar() {
  const { t } = useI18n();
  const wa = whatsappLink(buildGenericMessage(site.name, t('msg.generic')));
  const tel = telHref();

  return (
    <nav className="sticky-bar on-dark" aria-label="Quick actions" data-testid="sticky-bar">
      {tel ? (
        <a
          href={tel}
          onClick={() => track('call_click', { source: 'sticky_bar' })}
          data-testid="sticky-call"
        >
          <PhoneIcon />
          <span>{t('sticky.call')}</span>
        </a>
      ) : (
        <span role="note" className="btn-unconfigured" title={t('config.phoneMissing')}>
          <AlertIcon />
          <span>{t('sticky.call')}</span>
        </span>
      )}

      {wa.configured ? (
        <a
          href={wa.href}
          className="sticky-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('whatsapp_click', { source: 'sticky_bar' })}
          data-testid="sticky-whatsapp"
        >
          <WhatsAppIcon />
          <span>
            {t('sticky.whatsapp')}
            <span className="visually-hidden"> {t('a11y.opensNewTab')}</span>
          </span>
        </a>
      ) : (
        <span
          role="note"
          className="btn-unconfigured"
          title={t('config.whatsappMissingHelp')}
          data-testid="sticky-whatsapp-unconfigured"
        >
          <AlertIcon />
          <span>{t('config.whatsappMissing')}</span>
        </span>
      )}

      <a
        href={env.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('directions_click', { source: 'sticky_bar' })}
        data-testid="sticky-directions"
      >
        <NavigationIcon />
        <span>
          {t('sticky.directions')}
          <span className="visually-hidden"> {t('a11y.opensNewTab')}</span>
        </span>
      </a>
    </nav>
  );
}
