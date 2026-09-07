import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';

/**
 * Email bodies as pure functions (no transport, no env, no DB) so they can be
 * asserted in tests. Every message carries an unsubscribe link — including the
 * transactional ones, because the same address ends up on the list.
 */
export interface EmailBody {
  subject: string;
  html: string;
  text: string;
}

const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function layout(site: SiteKey, heading: string, blocks: string[], unsubscribeUrl: string): string {
  const config = getSite(site);
  return [
    `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:560px">`,
    `<p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;margin:0 0 16px">${esc(config.name)}</p>`,
    `<h1 style="font-size:20px;margin:0 0 16px">${esc(heading)}</h1>`,
    ...blocks,
    `<hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 12px">`,
    `<p style="font-size:12px;color:#777;margin:0">${esc(config.name)} · <a href="${esc(siteOrigin(site))}" style="color:#777">${esc(config.canonicalHost)}</a><br>`,
    `<a href="${esc(unsubscribeUrl)}" style="color:#777">Unsubscribe</a></p>`,
    `</div>`,
  ].join('');
}

const p = (content: string) => `<p style="margin:0 0 12px">${content}</p>`;

/** Internal notification to Anton — never seen by the visitor. */
export function leadNotification(input: {
  site: SiteKey;
  kind: string;
  leadId: number | string;
  name?: string | null;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  country?: string | null;
  nationality?: string | null;
  message?: string | null;
  quizResult?: string | null;
  pagePath?: string | null;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  const rows: [string, string | null | undefined][] = [
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['WhatsApp', input.whatsapp],
    ['Country', input.country],
    ['Nationality', input.nationality],
    ['Route Finder result', input.quizResult],
    ['Page', input.pagePath],
  ];
  const present = rows.filter(([, v]) => v);
  const subject = `New ${input.kind.replace(/_/g, ' ')} lead — ${config.name} (#${input.leadId})`;
  const html = layout(
    input.site,
    subject,
    [
      `<table style="border-collapse:collapse;font-size:14px">${present
        .map(
          ([label, value]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#666">${esc(label)}</td><td style="padding:2px 0">${esc(value)}</td></tr>`,
        )
        .join('')}</table>`,
      input.message ? `<p style="margin:16px 0 0;white-space:pre-wrap">${esc(input.message)}</p>` : '',
    ],
    input.unsubscribeUrl,
  );
  const text = [
    subject,
    '',
    ...present.map(([label, value]) => `${label}: ${value}`),
    input.message ? `\n${input.message}` : '',
  ].join('\n');
  return { subject, html, text };
}

/** Auto-reply to the person who filled the form. */
export function leadAutoReply(input: {
  site: SiteKey;
  name?: string | null;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  const subject = `We have your enquiry — ${config.name}`;
  const html = layout(
    input.site,
    'Thanks — we have your enquiry',
    [
      p(esc(greeting)),
      p('A person reads every enquiry here. You will get a reply within one working day, usually sooner.'),
      p(
        'If anything changed in the meantime, just reply to this email — it reaches the same inbox.',
      ),
      p(`— The team at ${esc(config.name)}`),
    ],
    input.unsubscribeUrl,
  );
  const text = `${greeting}

A person reads every enquiry here. You will get a reply within one working day, usually sooner.

If anything changed in the meantime, just reply to this email — it reaches the same inbox.

— The team at ${config.name}`;
  return { subject, html, text };
}

export function purchaseEmail(input: {
  site: SiteKey;
  name?: string | null;
  productName: string;
  downloadUrl: string;
  expiresAt: Date;
  maxDownloads: number;
  consultationUrl: string;
  unsubscribeUrl: string;
}): EmailBody {
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  const expiry = input.expiresAt.toISOString().replace('T', ' ').slice(0, 16);
  const subject = `Your download — ${input.productName}`;
  const html = layout(
    input.site,
    'Your download is ready',
    [
      p(esc(greeting)),
      p(`Thank you for buying ${esc(input.productName)}.`),
      p(
        `<a href="${esc(input.downloadUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Download the guide</a>`,
      ),
      p(
        `The link works for ${esc(input.maxDownloads)} downloads and expires on ${esc(expiry)} UTC. Save the file once you have it; if the link stops working, reply to this email and we will send a new one.`,
      ),
      p(
        `Want it done for you instead? <a href="${esc(input.consultationUrl)}">Book a 20-minute call</a> with the team that wrote it.`,
      ),
    ],
    input.unsubscribeUrl,
  );
  const text = `${greeting}

Thank you for buying ${input.productName}.

Download: ${input.downloadUrl}

The link works for ${input.maxDownloads} downloads and expires on ${expiry} UTC. Save the file once you have it; if the link stops working, reply to this email and we will send a new one.

Want it done for you instead? Book a 20-minute call: ${input.consultationUrl}`;
  return { subject, html, text };
}

export function subscribeConfirmEmail(input: {
  site: SiteKey;
  confirmUrl: string;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  const subject = `Confirm your subscription — ${config.name}`;
  const html = layout(
    input.site,
    'One click to confirm',
    [
      p('You asked for updates. Confirm the address so we know it is really yours.'),
      p(
        `<a href="${esc(input.confirmUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Confirm subscription</a>`,
      ),
      p('If you did not ask for this, ignore this email — nothing is sent until you confirm.'),
    ],
    input.unsubscribeUrl,
  );
  const text = `You asked for updates from ${config.name}. Confirm the address so we know it is really yours:

${input.confirmUrl}

If you did not ask for this, ignore this email — nothing is sent until you confirm.`;
  return { subject, html, text };
}
