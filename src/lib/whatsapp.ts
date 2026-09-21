import { env } from '@/config/env';

/**
 * WhatsApp deep-link helpers.
 * The number is sourced ONLY from PUBLIC_WHATSAPP_E164 (via config/env).
 */

export interface WhatsAppLinkResult {
  /** true when a valid number is configured */
  configured: boolean;
  /** https://wa.me/<E164>?text=<encoded> – or '' when not configured */
  href: string;
  /** The decoded message, for copy-to-clipboard fallbacks */
  message: string;
}

export function buildWhatsAppHref(e164: string, message: string): string {
  if (!e164) return '';
  const text = encodeURIComponent(message);
  return `https://wa.me/${e164}?text=${text}`;
}

export function whatsappLink(message: string, e164: string = env.whatsappE164): WhatsAppLinkResult {
  const configured = Boolean(e164);
  return {
    configured,
    href: configured ? buildWhatsAppHref(e164, message) : '',
    message,
  };
}

export function telHref(e164: string = env.phoneE164): string {
  return e164 ? `tel:+${e164}` : '';
}

/** Explains the configuration state for the dev-only banner. */
export function describeWhatsAppConfig(): { ok: boolean; reason: string } {
  if (env.whatsappE164) return { ok: true, reason: '' };
  if (!env.whatsappRaw) {
    return {
      ok: false,
      reason:
        'PUBLIC_WHATSAPP_E164 is not set. Add the verified WhatsApp Business number (E.164 digits, e.g. 919XXXXXXXXX) to your .env file and restart.',
    };
  }
  return {
    ok: false,
    reason: `PUBLIC_WHATSAPP_E164="${env.whatsappRaw}" is not valid E.164. Use country code + number, digits only, no "+", spaces or dashes (8–15 digits).`,
  };
}

/**
 * Opens WhatsApp in a new tab from a user gesture. Falls back to same-tab
 * navigation when the popup is blocked. (Note: passing "noopener" as a window
 * feature makes window.open() return null by spec, so the opener is severed manually.)
 */
export function openWhatsApp(href: string): void {
  if (!href) return;
  const opened = window.open(href, '_blank');
  if (opened) {
    try {
      opened.opener = null;
    } catch {
      /* cross-origin – ignore */
    }
  } else {
    window.location.assign(href);
  }
}
