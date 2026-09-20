import { env, formatE164ForDisplay } from '@/config/env';
import { fullAddress, site } from '@/config/site';
import { useI18n } from '@/i18n';
import { Link } from '@/lib/router';
import { CallLink, DirectionsLink, WhatsAppLink } from './ConversionLinks';

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer on-dark">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h2>{site.name}</h2>
            <p>{t('footer.tagline')}</p>
            <p className="small" style={{ marginTop: 'var(--space-3)' }}>
              {fullAddress()}
            </p>
            {env.phoneE164 ? (
              <p className="small" style={{ marginTop: 'var(--space-2)' }}>
                <a href={`tel:+${env.phoneE164}`}>{formatE164ForDisplay(env.phoneE164)}</a>
              </p>
            ) : null}
            {site.contactEmail ? (
              <p className="small" style={{ marginTop: 'var(--space-2)' }}>
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
              </p>
            ) : null}
          </div>
          <nav aria-label="Footer">
            <h2>{t('nav.menu')}</h2>
            <div className="footer-links">
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/products">{t('nav.products')}</Link>
              <Link to="/quote">{t('nav.quote')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
            </div>
          </nav>
          <div>
            <h2>{t('nav.contact')}</h2>
            <div className="btn-group" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <WhatsAppLink source="footer" />
              <CallLink source="footer" />
              <DirectionsLink source="footer" />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {year} {site.name}. {t('footer.rights')}
          </span>
          <span id="privacy">
            <strong>{t('footer.privacy')}:</strong> {t('footer.privacyNote')}
          </span>
        </div>
      </div>
    </footer>
  );
}
