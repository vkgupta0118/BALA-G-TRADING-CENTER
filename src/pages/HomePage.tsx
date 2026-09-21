import { CallLink, DirectionsLink, WhatsAppLink } from '@/components/ConversionLinks';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  categoryIcons,
  MapPinIcon,
  ShieldIcon,
  StarIcon,
  StoreIcon,
  TruckIcon,
  UsersIcon,
  WhatsAppIcon,
} from '@/components/icons';
import { LocationSection } from '@/components/LocationSection';
import { Reveal } from '@/components/Reveal';
import { LazyScene } from '@/components/scene/LazyScene';
import { productCategories } from '@/config/products';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { buildGenericMessage } from '@/lib/quote';
import { Link } from '@/lib/router';
import { faqItems } from '@/seo/pages';

function Hero() {
  const { t } = useI18n();
  const [first, ...rest] = t('hero.title').split(' ');
  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-copy">
          <span className="eyebrow">{t('hero.eyebrow')}</span>
          <h1 id="hero-title">
            <em>{first}</em> {rest.join(' ')}
          </h1>
          <p className="lead">{t('hero.subtitle')}</p>
          <ul className="hero-points" role="list">
            <li>
              <CheckCircleIcon />
              {t('hero.point1')}
            </li>
            <li>
              <CheckCircleIcon />
              {t('hero.point2')}
            </li>
            <li>
              <CheckCircleIcon />
              {t('hero.point3')}
            </li>
          </ul>
          <div className="btn-group">
            <Link to="/quote" className="btn btn-accent btn-lg" data-testid="hero-quote-cta">
              {t('cta.getQuote')}
              <ArrowRightIcon />
            </Link>
            <WhatsAppLink className="btn btn-whatsapp btn-lg" source="hero" />
            <CallLink className="btn btn-outline btn-lg" source="hero" />
          </div>
        </div>
        <LazyScene />
      </div>
    </section>
  );
}

function TrustStrip() {
  const { t } = useI18n();
  return (
    <section className="trust-strip" aria-label="At a glance">
      <div className="container">
        <div className="trust-item">
          <StoreIcon />
          {t('hero.point1')}
        </div>
        <div className="trust-item">
          <WhatsAppIcon />
          {t('hero.point2')}
        </div>
        <div className="trust-item">
          <MapPinIcon />
          {t('hero.point3')}
        </div>
      </div>
    </section>
  );
}

function ProductCategories() {
  const { t } = useI18n();
  return (
    <Reveal as="section" className="section" id="products" aria-labelledby="products-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('nav.products')}</span>
          <h2 id="products-title">{t('products.title')}</h2>
          <p className="lead">{t('products.subtitle')}</p>
        </div>
        <div className="grid grid-3">
          {productCategories.map((c) => {
            const Icon = categoryIcons[c.icon];
            return (
              <article className="card" key={c.id}>
                <div className="card-icon">
                  <Icon />
                </div>
                <h3>{c.name}</h3>
                <p>{c.shortDescription}</p>
                <div className="card-actions">
                  <Link to={`/quote?add=${c.id}`} className="btn btn-primary">
                    {t('cta.getQuote')}
                  </Link>
                  <WhatsAppLink
                    className="btn btn-ghost"
                    source={`home_category_${c.id}`}
                    message={buildGenericMessage(site.name, t('msg.product', { product: c.name }))}
                  >
                    {t('cta.requestPrice')}
                  </WhatsAppLink>
                </div>
              </article>
            );
          })}
          <article className="card card-dark">
            <div className="card-icon">
              <ArrowRightIcon />
            </div>
            <h3>{t('products.requestCard.title')}</h3>
            <p>{t('products.requestCard.body')}</p>
            <div className="card-actions">
              <Link to="/quote?add=materials" className="btn btn-accent">
                {t('products.requestCard.cta')}
              </Link>
            </div>
          </article>
        </div>
      </div>
    </Reveal>
  );
}

function WhyUs() {
  const { t } = useI18n();
  const items = [
    { icon: StoreIcon, title: t('why.1.title'), body: t('why.1.body') },
    { icon: WhatsAppIcon, title: t('why.2.title'), body: t('why.2.body') },
    { icon: MapPinIcon, title: t('why.3.title'), body: t('why.3.body') },
    { icon: UsersIcon, title: t('why.4.title'), body: t('why.4.body') },
  ];
  return (
    <Reveal as="section" className="section section-dark on-dark" aria-labelledby="why-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{site.shortName}</span>
          <h2 id="why-title">{t('why.title')}</h2>
        </div>
        <div className="grid grid-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <article className="card card-dark" key={item.title}>
                <div className="card-icon">
                  <Icon />
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)' }}>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

function DeliveryAndBrands() {
  const { t } = useI18n();
  return (
    <Reveal as="section" className="section section-alt" aria-labelledby="delivery-title">
      <div className="container">
        <div className="grid grid-2">
          <article className="card">
            <div className="card-icon">
              <TruckIcon />
            </div>
            <h3 id="delivery-title">{t('delivery.title')}</h3>
            <p data-testid="delivery-copy">
              {site.deliveryVerified ? t('delivery.verified') : t('delivery.unverified')}
            </p>
            <div className="card-actions">
              <Link to="/quote" className="btn btn-primary">
                {t('cta.getQuote')}
              </Link>
            </div>
          </article>
          {site.showBrands ? (
            <article className="card" data-testid="brands-section">
              <div className="card-icon">
                <ShieldIcon />
              </div>
              <h3>{t('brands.title')}</h3>
              <ul className="tag-list" role="list">
                {site.brands.map((b) => (
                  <li className="tag" key={b}>
                    {b}
                  </li>
                ))}
              </ul>
              <p className="small">{t('brands.note')}</p>
            </article>
          ) : (
            <article className="card">
              <div className="card-icon">
                <UsersIcon />
              </div>
              <h3>{t('area.title')}</h3>
              <p>{t('area.body')}</p>
              <ul className="tag-list" role="list" aria-label="Areas">
                {site.serviceAreas.slice(0, 8).map((a) => (
                  <li className="tag" key={a}>
                    {a}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function QuoteBand() {
  const { t } = useI18n();
  return (
    <section className="cta-band on-dark" aria-labelledby="quote-band-title">
      <div className="container">
        <div>
          <h2 id="quote-band-title">{t('quoteCta.title')}</h2>
          <p className="lead" style={{ color: 'var(--stone-300)' }}>
            {t('quoteCta.body')}
          </p>
        </div>
        <div className="btn-group">
          <Link to="/quote" className="btn btn-accent btn-lg">
            {t('cta.getQuote')}
            <ArrowRightIcon />
          </Link>
          <WhatsAppLink className="btn btn-whatsapp btn-lg" source="quote_band" />
        </div>
      </div>
    </section>
  );
}

function ServiceArea() {
  const { t } = useI18n();
  if (!site.showBrands) return null; // area card already shown in DeliveryAndBrands when brands are hidden
  return (
    <Reveal as="section" className="section" aria-labelledby="area-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{t('cta.directions')}</span>
          <h2 id="area-title">{t('area.title')}</h2>
          <p className="lead">{t('area.body')}</p>
        </div>
        <ul className="tag-list" role="list">
          {site.serviceAreas.map((a) => (
            <li className="tag" key={a}>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function Reviews() {
  const { t } = useI18n();
  return (
    <Reveal as="section" className="section" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Google</span>
          <h2 id="reviews-title">{t('reviews.title')}</h2>
        </div>
        {site.testimonials.length === 0 ? (
          <div className="review-empty" data-testid="reviews-empty">
            <span className="rating-stars" aria-hidden="true">
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </span>
            <p className="lead">{t('reviews.empty')}</p>
            <div className="btn-group">
              <DirectionsLink className="btn btn-primary" source="reviews_read">
                {t('reviews.readGoogle')}
              </DirectionsLink>
              <DirectionsLink className="btn btn-outline" source="reviews_write">
                {t('reviews.leaveGoogle')}
              </DirectionsLink>
            </div>
          </div>
        ) : (
          <div className="grid grid-3">
            {site.testimonials.map((r) => (
              <article className="review-card" key={`${r.author}-${r.quote.slice(0, 12)}`}>
                <blockquote>“{r.quote}”</blockquote>
                <footer>
                  {r.author}
                  {r.role ? `, ${r.role}` : ''} · {t('reviews.source')}: {r.source}
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

function Faq() {
  const { t, lang } = useI18n();
  const items = faqItems(lang);
  return (
    <Reveal as="section" className="section section-alt" aria-labelledby="faq-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2 id="faq-title">{t('faq.title')}</h2>
        </div>
        <div className="faq">
          {items.map((item, i) => (
            <details key={item.question} open={i === 0}>
              <summary>
                {item.question}
                <ChevronDownIcon />
              </summary>
              <div>{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ProductCategories />
      <WhyUs />
      <DeliveryAndBrands />
      <QuoteBand />
      <ServiceArea />
      <Reviews />
      <Faq />
      <LocationSection />
    </>
  );
}
