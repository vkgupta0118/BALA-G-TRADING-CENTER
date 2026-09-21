import { WhatsAppLink } from '@/components/ConversionLinks';
import { PageHeader } from '@/components/PageHeader';
import { useI18n } from '@/i18n';
import { Link } from '@/lib/router';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader eyebrow="404" title={t('notFound.title')} lead={t('notFound.body')} />
      <section className="section">
        <div className="container">
          <div className="btn-group">
            <Link to="/" className="btn btn-primary">
              {t('notFound.home')}
            </Link>
            <Link to="/products" className="btn btn-outline">
              {t('nav.products')}
            </Link>
            <WhatsAppLink source="404" />
          </div>
        </div>
      </section>
    </>
  );
}
