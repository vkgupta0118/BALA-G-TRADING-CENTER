import { env, formatE164ForDisplay } from '@/config/env';
import { fullAddress, site } from '@/config/site';
import { useI18n } from '@/i18n';
import { CallLink, DirectionsLink, WhatsAppLink } from './ConversionLinks';
import { ClockIcon, MapPinIcon, PhoneIcon, StoreIcon } from './icons';

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

function formatTime(t: string): string {
  const [h = '0', m = '00'] = t.split(':');
  const hour = Number(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

export function HoursList() {
  const { t } = useI18n();
  if (!site.hoursVerified || site.openingHours.length === 0) {
    return <p data-testid="hours-unverified">{t('location.hoursUnverified')}</p>;
  }
  return (
    <ul role="list" data-testid="hours-list">
      {site.openingHours.map((h) => {
        const first = h.days[0];
        const lastDay = h.days[h.days.length - 1];
        const range =
          h.days.length > 1 && first && lastDay
            ? `${DAY_SHORT[first]}–${DAY_SHORT[lastDay]}`
            : h.days.map((d) => DAY_SHORT[d]).join(', ');
        return (
          <li key={range}>
            {range}: {formatTime(h.opens)} – {formatTime(h.closes)}
          </li>
        );
      })}
    </ul>
  );
}

/** Stylised (non-map) location card. Replace with a Google Maps embed when the owner supplies the embed URL. */
function LocationArt() {
  return (
    <svg viewBox="0 0 480 260" aria-hidden="true" focusable="false">
      <rect width="480" height="260" fill="#292524" />
      <g stroke="#44403C" strokeWidth="2">
        <path d="M0 60H480M0 130H480M0 200H480M80 0V260M180 0V260M300 0V260M400 0V260" />
      </g>
      <path
        d="M-10 225 C 120 190, 260 250, 500 200"
        stroke="#E3B341"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <text
        x="40"
        y="196"
        fill="#D6D3D1"
        fontFamily="Source Sans 3, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        CHAMPASARI ROAD
      </text>
      <g transform="translate(250 96)">
        <circle r="26" fill="#E3B341" fillOpacity="0.18" />
        <path
          d="M0 -30 C 12 -30 20 -21 20 -10 C 20 4 0 22 0 22 C 0 22 -20 4 -20 -10 C -20 -21 -12 -30 0 -30Z"
          fill="#E3B341"
        />
        <circle cy="-10" r="7" fill="#1C1917" />
      </g>
      <text
        x="250"
        y="150"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Source Sans 3, sans-serif"
        fontSize="16"
        fontWeight="700"
      >
        Debidanga Bazar · Siliguri 734003
      </text>
      <text
        x="250"
        y="172"
        textAnchor="middle"
        fill="#A8A29E"
        fontFamily="Source Sans 3, sans-serif"
        fontSize="13"
      >
        near Uttarbanga Kshetriya Gramin Bank
      </text>
    </svg>
  );
}

export function LocationSection({ id = 'location' }: { id?: string }) {
  const { t } = useI18n();
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{site.address.city}</span>
          <h2 id={`${id}-title`}>{t('location.title')}</h2>
        </div>
        <div className="location-grid">
          <dl className="info-list">
            <div>
              <MapPinIcon />
              <dt>{t('location.addressLabel')}</dt>
              <dd>
                <address style={{ fontStyle: 'normal' }}>{fullAddress()}</address>
              </dd>
            </div>
            <div>
              <StoreIcon />
              <dt>{t('location.landmark')}</dt>
              <dd>{site.landmark}</dd>
            </div>
            <div>
              <ClockIcon />
              <dt>{t('location.hoursLabel')}</dt>
              <dd>
                <HoursList />
              </dd>
            </div>
            {env.phoneE164 ? (
              <div>
                <PhoneIcon />
                <dt>{t('cta.call')}</dt>
                <dd>
                  <a href={`tel:+${env.phoneE164}`}>{formatE164ForDisplay(env.phoneE164)}</a>
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="map-card on-dark">
            <LocationArt />
            <div className="btn-group">
              <DirectionsLink className="btn btn-accent" source="location">
                {t('location.mapCta')}
              </DirectionsLink>
              <CallLink source="location" />
              <WhatsAppLink source="location" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
