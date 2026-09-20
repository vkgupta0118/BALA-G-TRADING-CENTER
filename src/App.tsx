import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { I18nProvider, type Lang, useI18n } from '@/i18n';
import { initAnalytics } from '@/lib/analytics';
import { useDocumentHead } from '@/lib/head';
import { RouterProvider, useRouter } from '@/lib/router';
import { ContactPage } from '@/pages/ContactPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { QuotePage } from '@/pages/QuotePage';
import { getPageSeo } from '@/seo/pages';

function Routes() {
  const { path } = useRouter();
  const { lang } = useI18n();
  const seo = getPageSeo(path, lang);
  useDocumentHead(seo, lang);

  switch (path) {
    case '/':
      return <HomePage />;
    case '/products':
      return <ProductsPage />;
    case '/quote':
      return <QuotePage />;
    case '/contact':
      return <ContactPage />;
    default:
      return <NotFoundPage />;
  }
}

function AnalyticsBoot() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}

export function App({ url, lang = 'en' }: { url: string; lang?: Lang }) {
  return (
    <I18nProvider initialLang={lang}>
      <RouterProvider initialPath={url}>
        <AnalyticsBoot />
        <Layout>
          <Routes />
        </Layout>
      </RouterProvider>
    </I18nProvider>
  );
}
