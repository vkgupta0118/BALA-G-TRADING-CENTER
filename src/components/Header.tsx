import { useEffect, useId, useRef, useState } from 'react';
import { site } from '@/config/site';
import { LANGS, type Lang, useI18n } from '@/i18n';
import { Link } from '@/lib/router';
import { WhatsAppLink } from './ConversionLinks';
import { CloseIcon, GlobeIcon, MenuIcon } from './icons';

const NAV = [
  { to: '/', key: 'nav.home' },
  { to: '/products', key: 'nav.products' },
  { to: '/quote', key: 'nav.quote' },
  { to: '/contact', key: 'nav.contact' },
] as const;

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="8" fill="#E3B341" />
      <rect x="7" y="9" width="12" height="6" rx="1" fill="#1C1917" />
      <rect x="21" y="9" width="12" height="6" rx="1" fill="#1C1917" />
      <rect x="13" y="17" width="12" height="6" rx="1" fill="#1C1917" />
      <rect x="7" y="25" width="12" height="6" rx="1" fill="#1C1917" />
      <rect x="21" y="25" width="12" height="6" rx="1" fill="#1C1917" />
    </svg>
  );
}

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  const other: Lang = lang === 'en' ? 'bn' : 'en';
  return (
    <>
      {/* Compact single toggle (mobile) – shows the language you can switch TO */}
      <button
        type="button"
        className="lang-toggle"
        lang={other}
        onClick={() => setLang(other)}
        aria-label={`${t('lang.switch')}: ${t(`lang.${other}`)}`}
        data-testid="lang-toggle"
      >
        <GlobeIcon />
        {t(`lang.${other}`)}
      </button>
      {/* Full two-state switch (desktop) */}
      <fieldset className={`lang-switch ${className}`.trim()}>
        <legend className="visually-hidden">{t('lang.switch')}</legend>
        {LANGS.map((code: Lang) => (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={lang === code}
            onClick={() => setLang(code)}
            data-testid={`lang-${code}`}
          >
            {t(`lang.${code}`)}
          </button>
        ))}
      </fieldset>
    </>
  );
}

export function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on Escape (links close it on click).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header on-dark">
      <div className="container">
        <Link to="/" className="brand" aria-label={`${site.name} – ${t('nav.home')}`}>
          <BrandMark />
          <span className="brand-text">
            <span className="brand-name brand-name-full">{site.name}</span>
            <span className="brand-name brand-name-short" aria-hidden="true">
              {site.shortName}
            </span>
            <span className="brand-sub">
              Siliguri · {t('footer.tagline').split(' · ').slice(0, 3).join(' · ')}
            </span>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link">
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSwitch />
          <WhatsAppLink className="btn btn-whatsapp header-cta" source="header" />
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? t('nav.close') : t('nav.menu')}
            onClick={() => setOpen((v) => !v)}
            data-testid="menu-toggle"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id={menuId}
          className="nav-mobile"
          aria-label="Primary mobile"
          data-testid="mobile-menu"
        >
          <div className="container">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="nav-link" onClick={() => setOpen(false)}>
                {t(item.key)}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
