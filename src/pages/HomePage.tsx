import { CallLink, DirectionsLink, WhatsAppLink } from '@/components/ConversionLinks';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  categoryIcons,
  MapPinIcon,
  PujaIcon,
  ShieldIcon,
  StarIcon,
  StoreIcon,
  TruckIcon,
  UsersIcon,
  WhatsAppIcon,
} from '@/components/icons';
import { LocationSection } from '@/components/LocationSection';
import { PhotoPending, Picture } from '@/components/Picture';
import { Reveal } from '@/components/Reveal';
import { productCategories } from '@/config/products';
import { site } from '@/config/site';
import { useI18n } from '@/i18n';
import { buildGenericMessage } from '@/lib/quote';
import { Link } from '@/lib/router';
import { faqItems } from '@/seo/pages';

/**
 * Hero: one photograph of the shop's own stock, one value proposition,
 * one primary CTA ("Get today's price") and one secondary CTA ("Call shop").
 * The photograph is the only eager image on the page.
 */
function Hero() {
  const { t } = useI18n();
  return (
    <section className="hero on-dark" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-copy">
          <span className="eyebrow">{t('hero.eyebrow')}</span>
          <h1 id="hero-title">{t('hero.title')}</h1>
          <p className="lead">{t('hero.subtitle')}</p>
          {site.hoursVerified ? (
            <p className="hours-badge" data-testid="hours-badge">
              <ClockIcon />
              {t('hero.openNow')}
            </p>
          ) : null}
          <ul className="hero-points" role="list">
            <li>
              <CheckCircleIcon />
              {t('hero.point1')}
            </li>
            <li>
              <CheckCircleIcon />
              {t('hero.point2')}
            </li>
            {site.deliveryVerified ? (
              <li>
                <CheckCircleIcon />
                {t('hero.point3')}
              </li>
            ) : null}
          </ul>
          <div className="btn-group">
            <Link to="/quote" className="btn btn-accent btn-lg" data-testid="hero-quote-cta">
              {t('cta.todaysPrice')}
              <ArrowRightIcon />
            </Link>
            <CallLink className="btn btn-outline btn-lg" source="hero">
              {t('cta.callShop')}
            </CallLink>
          </div>
        </div>
        <figure className="hero-media" data-testid="hero-media">
          <Picture
            slug="bricks-stack"
            alt={t('hero.imageAlt')}
            sizes="(min-width: 64em) 44vw, 100vw"
            priority
          />
          <figcaption>
            <MapPinIcon />
            {site.landmark}
          </figcaption>
        </figure>
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
          <ClockIcon />
          {t('hero.openNow')}
        </div>
      </div>
    </section>
  );
}

/** The one sanctioned Puja Samagri claim, and nothing beyond it. */
function PujaNote() {
  const { t } = useI18n();
  const counter = site.pujaCounterName;
  return (
    <p className="puja-note" data-testid="puja-note">
      <PujaIcon />
      <span>
        {counter ? t('puja.counterLine', { counter, business: site.name }) : t('puja.available')}
      </span>
    </p>
  );
}

/** Each category leads with its own photograph, or an honest "photo coming" panel. */
function CategoryMedia({ category }: { category: (typeof productCategories)[number] }) {
  const { t } = useI18n();
  if (category.image && category.imageAlt) {
    return (
      <div className="card-media">
        <Picture
          slug={category.image}
          alt={category.imageAlt}
          sizes="(min-width: 64em) 22rem, (min-width: 48em) 45vw, 92vw"
        />
      </div>
    );
  }
  if (category.photoPending) {
    return (
      <div className="card-media">
        <PhotoPending label={t('products.photoPendingOf', { name: category.name })} />
      </div>
    );
  }
  return null;
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
                <CategoryMedia category={c} />
                <div className="card-icon">
                  <Icon />
                </div>
                <h3>{c.name}</h3>
                <p>{c.shortDescription}</p>
                {c.typicalSpecs ? (
                  <p className="card-specs">
                    <strong>{t('products.specs')}</strong>
                    {c.typicalSpecs}
                  </p>
                ) : null}
                <div className="card-actions">
                  <Link to={`/quote?add=${c.id}`} className="btn btn-primary">
                    {t('cta.todaysPrice')}
                  </Link>
                  <WhatsAppLink
                    className="btn btn-ghost"
                    source={`home_category_${c.id}`}
                    message={buildGenericMessage(site.name, t('msg.product', { product: c.name }))}
                  >
                    {t('cta.whatsapp')}
                  </WhatsAppLink>
                </div>
              </article>
            );
          })}
        </div>
        <PujaNote />
      </div>
    </Reveal>
  );
}

/** Four plain steps, so nobody has to guess what happens after they tap the button. */
function HowToOrder() {
  const { t } = useI18n();
  const steps = [1, 2, 3, 4] as const;
  return (
    <Reveal as="section" className="section section-alt" aria-labelledby="howto-title">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">WhatsApp</span>
          <h2 id="howto-title">{t('howTo.title')}</h2>
          <p className="lead">{t('howTo.subtitle')}</p>
        </div>
        <ol className="steps" role="list" data-testid="how-to-order">
          {steps.map((n) => (
            <li className="step" key={n}>
              <h3>{t(`howTo.${n}.title`)}</h3>
              <p>{t(`howTo.${n}.body`)}</p>
            </li>
          ))}
        </ol>
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
    <Reveal as="section" className="section" aria-labelledby="delivery-title">
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
                {t('cta.todaysPrice')}
              </Link>
            </div>
          </article>
          {site.showBrands ? (
            <article className="card" data-testid="brands-section">
              <div className="card-media">
                <Picture
                  slug="cement-brands"
                  alt="UltraTech Premium and Ambuja cement bags stacked in the godown at Balajee Trading Centre"
                  sizes="(min-width: 64em) 30rem, 92vw"
                />
              </div>
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
            {t('cta.todaysPrice')}
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
    <Reveal as="section" className="section section-alt" aria-labelledby="reviews-title">
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
    <Reveal as="section" className="section" aria-labelledby="faq-title">
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
      <HowToOrder />
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
