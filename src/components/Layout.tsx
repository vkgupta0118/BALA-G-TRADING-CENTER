import type { ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { ConsentBanner } from './ConsentBanner';
import { DevConfigBanner } from './DevConfigBanner';
import { Footer } from './Footer';
import { Header } from './Header';
import { StickyBar } from './StickyBar';

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <a href="#main" className="skip-link">
        {t('nav.skip')}
      </a>
      <DevConfigBanner />
      <Header />
      {/* tabIndex=-1 makes <main> a programmatic focus target after client-side navigation */}
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        {children}
      </main>
      <Footer />
      <StickyBar />
      <ConsentBanner />
    </>
  );
}
