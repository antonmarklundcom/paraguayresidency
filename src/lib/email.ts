import 'server-only';
import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import { pack } from './signing';

/**
 * Resend → SMTP → console, decided at call time from the environment
 * (plan §5.2.6 / §4.5). Missing credentials never block a build or a form:
 * with nothing configured the message is logged and the caller still succeeds.
 */
export type EmailMode = 'resend' | 'smtp' | 'console';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailOutcome {
  ok: boolean;
  mode: EmailMode;
  id?: string;
  error?: string;
}

export function emailMode(): EmailMode {
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) return 'smtp';
  return 'console';
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM || 'Paraguay Residency <hello@paraguayresidency.co.uk>';
}

/** Where internal notifications go. Falls back to the from-address mailbox. */
export function notifyTo(): string | null {
  const configured = (process.env.EMAIL_NOTIFY_TO ?? '').trim();
  if (configured) return configured;
  const match = emailFrom().match(/<([^>]+)>/);
  return match ? match[1] : null;
}

/**
 * The one-click unsubscribe URL. Stateless: the address is signed rather than
 * looked up, so a link in a purchase email works even for an address that was
 * never on the list.
 */
export function unsubscribeUrl(site: SiteKey, email: string): string {
  return `${siteOrigin(site)}/unsubscribe?u=${encodeURIComponent(pack(email.toLowerCase(), 'unsubscribe'))}`;
}

export function confirmUrl(site: SiteKey, token: string): string {
  return `${siteOrigin(site)}/confirm?token=${encodeURIComponent(token)}`;
}

/** Never throws. Failures are logged and reported, never propagated. */
export async function sendEmail(message: EmailMessage): Promise<EmailOutcome> {
  const mode = emailMode();
  const to = Array.isArray(message.to) ? message.to : [message.to];
  if (to.length === 0 || to.some((address) => !address)) {
    return { ok: false, mode, error: 'no recipient' };
  }

  try {
    if (mode === 'resend') return await sendViaResend(message, to);
    if (mode === 'smtp') return await sendViaSmtp(message, to);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[email] ${mode} send failed`, detail);
    return { ok: false, mode, error: detail };
  }

  console.info(
    `[email] (console mode — no RESEND_API_KEY or SMTP config)\n  to: ${to.join(', ')}\n  subject: ${message.subject}\n${message.text.replace(/^/gm, '  | ')}`,
  );
  return { ok: true, mode: 'console' };
}

async function sendViaResend(message: EmailMessage, to: string[]): Promise<EmailOutcome> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom(),
      to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) {
    console.error('[email] resend rejected', response.status, body);
    return { ok: false, mode: 'resend', error: body.message ?? `HTTP ${response.status}` };
  }
  return { ok: true, mode: 'resend', id: body.id };
}

async function sendViaSmtp(message: EmailMessage, to: string[]): Promise<EmailOutcome> {
  // Imported lazily so the SMTP dependency is not pulled into a build that
  // only ever uses Resend or console mode.
  const nodemailer = (await import('nodemailer')).default;
  const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });
  const info = await transport.sendMail({
    from: emailFrom(),
    to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
  });
  return { ok: true, mode: 'smtp', id: info.messageId };
}

/** Absolute URL on a brand's own host — emails can never use a relative path. */
export function absoluteUrl(site: SiteKey, path: string): string {
  return `${siteOrigin(site)}${path.startsWith('/') ? path : `/${path}`}`;
}

export function siteName(site: SiteKey): string {
  return getSite(site).name;
}
