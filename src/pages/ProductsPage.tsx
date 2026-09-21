import { WhatsAppLink } from '@/components/ConversionLinks';
import { ArrowRightIcon, CheckIcon, categoryIcons, PujaIcon } from '@/components/icons';
import { PageHeader } from '@/components/PageHeader';
import { PhotoPending, Picture } from '@/components/Picture';
import { Reveal } from '@/components/Reveal';
import { productCategories } from '@/config/products';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { buildGenericMessage } from '@/lib/quote';
import { Link } from '@/lib/router';

export function ProductsPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        eyebrow={`${site.address.city} · ${site.address.locality}`}
        title={t('products.title')}
        lead={t('products.subtitle')}
      />
      <section className="section" aria-label={t('nav.products')}>
        <div className="container">
          <p
            className="puja-note"
            data-testid="puja-note"
            style={{ marginBottom: 'var(--space-8)' }}
          >
            <PujaIcon />
            <span>
              {site.pujaCounterName
                ? t('puja.counterLine', {
                    counter: site.pujaCounterName,
                    business: site.name,
                  })
                : t('puja.available')}
            </span>
          </p>
          <div className="grid grid-2">
            {productCategories.map((c) => {
              const Icon = categoryIcons[c.icon];
              return (
                <Reveal as="article" className="card" id={c.slug} key={c.id}>
                  {c.image && c.imageAlt ? (
                    <div className="card-media">
                      <Picture
                        slug={c.image}
                        alt={c.imageAlt}
                        sizes="(min-width: 64em) 34rem, 92vw"
                      />
                    </div>
                  ) : c.photoPending ? (
                    <div className="card-media">
                      <PhotoPending label={t('products.photoPendingOf', { name: c.name })} />
                    </div>
                  ) : null}
                  <div className="card-icon">
                    <Icon />
                  </div>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  {c.typicalSpecs ? (
                    <p className="card-specs">
                      <strong>{t('products.specs')}</strong>
                      {c.typicalSpecs}
                    </p>
                  ) : null}
                  <div>
                    <h4 className="small" style={{ marginBottom: 'var(--space-2)' }}>
                      {t('products.uses')}
                    </h4>
                    <ul className="tag-list" role="list">
                      {c.uses.map((u) => (
                        <li className="tag" key={u}>
                          {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="small" style={{ marginBottom: 'var(--space-2)' }}>
                      {t('products.askFor')}
                    </h4>
                    <ul className="check-list" role="list">
                      {c.askFor.map((a) => (
                        <li key={a}>
                          <CheckIcon />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card-actions">
                    <Link
                      to={`/quote?add=${c.id}`}
                      className="btn btn-primary"
                      data-testid={`add-${c.id}`}
                    >
                      {t('cta.todaysPrice')}
                      <ArrowRightIcon />
                    </Link>
                    <WhatsAppLink
                      className="btn btn-whatsapp"
                      source={`products_${c.id}`}
                      message={buildGenericMessage(
                        site.name,
                        t('msg.product', { product: c.name }),
                      )}
                    >
                      {t('cta.requestPrice')}
                    </WhatsAppLink>
                  </div>
                </Reveal>
              );
            })}
            <Reveal as="article" className="card card-dark on-dark">
              <div className="card-icon">
                <ArrowRightIcon />
              </div>
              <h3>{t('products.requestCard.title')}</h3>
              <p>{t('products.requestCard.body')}</p>
              <div className="card-actions">
                <Link to="/quote?add=materials" className="btn btn-accent">
                  {t('products.requestCard.cta')}
                </Link>
                <WhatsAppLink className="btn btn-outline" source="products_request" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
