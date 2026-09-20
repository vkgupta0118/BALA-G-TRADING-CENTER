import { env } from '@/config/env';
import { describeWhatsAppConfig } from '@/lib/whatsapp';
import { AlertIcon } from './icons';

/**
 * Development-only helper. Explains missing configuration instead of letting
 * broken links ship silently. Never rendered in production builds.
 */
export function DevConfigBanner() {
  if (!env.isDev) return null;
  const wa = describeWhatsAppConfig();
  const issues: string[] = [];
  if (!wa.ok) issues.push(wa.reason);
  if (!env.siteUrl)
    issues.push('PUBLIC_SITE_URL is empty – canonical/OG URLs and sitemap will use a placeholder.');
  if (issues.length === 0) return null;

  return (
    <aside className="dev-banner" role="status" data-testid="dev-config-banner">
      <div className="container">
        <AlertIcon />
        <div>
          <strong>Development configuration</strong>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem' }}>
            {issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <span className="small">
            Copy <code>.env.example</code> to <code>.env</code> and restart the dev server.
          </span>
        </div>
      </div>
    </aside>
  );
}
