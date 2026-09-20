import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { type ConsentState, getConsent, hasAnyProvider, setConsent } from '@/lib/analytics';

/**
 * Shown only when at least one analytics provider ID is configured and the
 * visitor has not decided yet. Nothing loads before "Allow analytics".
 */
export function ConsentBanner() {
  const { t } = useI18n();
  const [state, setState] = useState<ConsentState | 'ssr'>('ssr');

  useEffect(() => {
    setState(getConsent());
  }, []);

  if (state === 'ssr' || state !== 'unknown' || !hasAnyProvider()) return null;

  const decide = (next: 'granted' | 'denied') => {
    setConsent(next);
    setState(next);
  };

  return (
    <section className="consent" aria-labelledby="consent-title" data-testid="consent-banner">
      <h2 id="consent-title">{t('consent.title')}</h2>
      <p>{t('consent.body')}</p>
      <div className="btn-group">
        <button type="button" className="btn btn-primary" onClick={() => decide('granted')}>
          {t('consent.accept')}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => decide('denied')}>
          {t('consent.decline')}
        </button>
      </div>
    </section>
  );
}
