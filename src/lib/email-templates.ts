import { getSite, siteOrigin, type SiteKey } from '@/sites/registry';
import type { Locale } from '@/i18n/locales';

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

/**
 * The footer link, in the brand's language (O26 bug 2). Every email a visitor
 * of any brand can receive goes through `layout`, so this is the one place.
 */
const UNSUBSCRIBE: Record<Locale, string> = {
  en: 'Unsubscribe',
  es: 'Darse de baja',
  pt: 'Cancelar inscrição',
  sv: 'Avsluta prenumerationen',
};

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
    `<a href="${esc(unsubscribeUrl)}" style="color:#777">${esc(UNSUBSCRIBE[config.locale])}</a></p>`,
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

/**
 * The generic auto-reply, per locale. Spanish has its own function below
 * because its free-guide branch has no counterpart in the other languages.
 * Portuguese uses você, Swedish du (plan §1.3).
 */
const AUTO_REPLY: Record<Exclude<Locale, 'es'>, {
  greeting: (name?: string | null) => string;
  subject: (brand: string) => string;
  heading: string;
  lines: [string, string];
  signoff: (brand: string) => string;
}> = {
  en: {
    greeting: (name) => (name ? `Hi ${name},` : 'Hi,'),
    subject: (brand) => `We have your enquiry — ${brand}`,
    heading: 'Thanks — we have your enquiry',
    lines: [
      'A person reads every enquiry here. You will get a reply within one working day, usually sooner.',
      'If anything changed in the meantime, just reply to this email — it reaches the same inbox.',
    ],
    signoff: (brand) => `— The team at ${brand}`,
  },
  pt: {
    greeting: (name) => (name ? `Olá, ${name}!` : 'Olá!'),
    subject: (brand) => `Recebemos sua mensagem — ${brand}`,
    heading: 'Obrigado — recebemos sua mensagem',
    lines: [
      'Uma pessoa lê cada mensagem aqui. Você receberá uma resposta em até um dia útil, geralmente antes.',
      'Se algo mudou nesse meio-tempo, é só responder a este e-mail — ele chega à mesma caixa de entrada.',
    ],
    signoff: (brand) => `— A equipe do ${brand}`,
  },
  sv: {
    greeting: (name) => (name ? `Hej ${name},` : 'Hej,'),
    subject: (brand) => `Vi har tagit emot din förfrågan — ${brand}`,
    heading: 'Tack — vi har tagit emot din förfrågan',
    lines: [
      'En människa läser varje förfrågan här. Du får svar inom en arbetsdag, oftast tidigare.',
      'Om något har ändrats under tiden kan du bara svara på det här mejlet — det går till samma inkorg.',
    ],
    signoff: (brand) => `— Teamet på ${brand}`,
  },
};

/** Auto-reply to the person who filled the form, in the brand's language. */
export function leadAutoReply(input: {
  site: SiteKey;
  name?: string | null;
  /** The public path the form sat on; the free-guide form gets its link back. */
  pagePath?: string | null;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  if (config.locale === 'es') return leadAutoReplyEs({ ...input, config });
  const copy = AUTO_REPLY[config.locale];
  const greeting = copy.greeting(input.name);
  const subject = copy.subject(config.name);
  const signoff = copy.signoff(config.name);
  const html = layout(
    input.site,
    copy.heading,
    [p(esc(greeting)), p(esc(copy.lines[0])), p(esc(copy.lines[1])), p(esc(signoff))],
    input.unsubscribeUrl,
  );
  const text = [greeting, '', copy.lines[0], '', copy.lines[1], '', signoff].join('\n');
  return { subject, html, text };
}

/**
 * The Spanish auto-reply (residenciaenparaguay.es). A lead from the free-guide
 * form (`/guia-gratis`) gets the reading link, since that is what it asked for.
 */
function leadAutoReplyEs(input: {
  site: SiteKey;
  config: ReturnType<typeof getSite>;
  name?: string | null;
  pagePath?: string | null;
  unsubscribeUrl: string;
}): EmailBody {
  const { config } = input;
  const greeting = input.name ? `Hola ${input.name}:` : 'Hola:';
  const guideUrl = input.pagePath?.startsWith('/guia-gratis') ? `${siteOrigin(input.site)}/guia-gratis/leer` : null;
  const subject = guideUrl ? `Tu guía gratis de residencia en Paraguay — ${config.name}` : `Recibimos tu consulta — ${config.name}`;
  const lines = guideUrl
    ? [
        'Gracias por pedir la guía. Aquí tienes el enlace para leerla cuando quieras:',
        'Si al leerla te surge una duda sobre tu caso, responde a este correo o escríbenos por WhatsApp. Una persona del equipo te contesta por escrito en un día hábil.',
      ]
    : [
        'Una persona lee cada consulta. Te respondemos por escrito en un día hábil, normalmente antes.',
        'Si algo cambió mientras tanto, responde a este correo: llega a la misma bandeja.',
      ];
  const html = layout(
    input.site,
    guideUrl ? 'Tu guía gratis está lista' : 'Gracias, recibimos tu consulta',
    [
      p(esc(greeting)),
      p(esc(lines[0])),
      guideUrl
        ? p(`<a href="${esc(guideUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Abrir la guía</a>`)
        : '',
      p(esc(lines[1])),
      p(`— El equipo de ${esc(config.name)}`),
    ],
    input.unsubscribeUrl,
  );
  const text = [greeting, '', lines[0], ...(guideUrl ? ['', guideUrl] : []), '', lines[1], '', `— El equipo de ${config.name}`].join('\n');
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
        `Want it done for you instead? <a href="${esc(input.consultationUrl)}">Message the team that wrote it</a> on WhatsApp or through the form. A person answers in writing within one working day.`,
      ),
    ],
    input.unsubscribeUrl,
  );
  const text = `${greeting}

Thank you for buying ${input.productName}.

Download: ${input.downloadUrl}

The link works for ${input.maxDownloads} downloads and expires on ${expiry} UTC. Save the file once you have it; if the link stops working, reply to this email and we will send a new one.

Want it done for you instead? Message the team that wrote it (WhatsApp or the form, answered in writing within one working day): ${input.consultationUrl}`;
  return { subject, html, text };
}

/**
 * The newsletter confirmation, per locale: any brand's footer or `/confirm`
 * page can start a subscription, so a Spanish, Portuguese or Swedish visitor
 * gets this mail too (O26 bug 2). The purchase, sign-in and Insider mails stay
 * English-only: only `guide` sells (`siteSellsProducts`), and it is English.
 */
const SUBSCRIBE_CONFIRM: Record<Locale, {
  subject: (brand: string) => string;
  heading: string;
  ask: string;
  intro: (brand: string) => string;
  button: string;
  ignore: string;
}> = {
  en: {
    subject: (brand) => `Confirm your subscription — ${brand}`,
    heading: 'One click to confirm',
    ask: 'You asked for updates. Confirm the address so we know it is really yours.',
    intro: (brand) => `You asked for updates from ${brand}. Confirm the address so we know it is really yours:`,
    button: 'Confirm subscription',
    ignore: 'If you did not ask for this, ignore this email — nothing is sent until you confirm.',
  },
  es: {
    subject: (brand) => `Confirma tu suscripción — ${brand}`,
    heading: 'Un clic para confirmar',
    ask: 'Pediste recibir novedades. Confirma la dirección para que sepamos que es realmente tuya.',
    intro: (brand) => `Pediste recibir novedades de ${brand}. Confirma la dirección para que sepamos que es realmente tuya:`,
    button: 'Confirmar suscripción',
    ignore: 'Si no lo pediste, ignora este correo: no se envía nada hasta que confirmes.',
  },
  pt: {
    subject: (brand) => `Confirme sua inscrição — ${brand}`,
    heading: 'Um clique para confirmar',
    ask: 'Você pediu para receber novidades. Confirme o endereço para sabermos que ele é realmente seu.',
    intro: (brand) => `Você pediu para receber novidades do ${brand}. Confirme o endereço para sabermos que ele é realmente seu:`,
    button: 'Confirmar inscrição',
    ignore: 'Se você não pediu isso, ignore este e-mail — nada é enviado até você confirmar.',
  },
  sv: {
    subject: (brand) => `Bekräfta din prenumeration — ${brand}`,
    heading: 'Ett klick för att bekräfta',
    ask: 'Du har bett om uppdateringar. Bekräfta adressen så att vi vet att den verkligen är din.',
    intro: (brand) => `Du har bett om uppdateringar från ${brand}. Bekräfta adressen så att vi vet att den verkligen är din:`,
    button: 'Bekräfta prenumerationen',
    ignore: 'Om du inte har bett om detta kan du ignorera det här mejlet — inget skickas förrän du bekräftar.',
  },
};

export function subscribeConfirmEmail(input: {
  site: SiteKey;
  confirmUrl: string;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  const copy = SUBSCRIBE_CONFIRM[config.locale];
  const subject = copy.subject(config.name);
  const html = layout(
    input.site,
    copy.heading,
    [
      p(esc(copy.ask)),
      p(
        `<a href="${esc(input.confirmUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${esc(copy.button)}</a>`,
      ),
      p(esc(copy.ignore)),
    ],
    input.unsubscribeUrl,
  );
  const text = `${copy.intro(config.name)}

${input.confirmUrl}

${copy.ignore}`;
  return { subject, html, text };
}

/**
 * The sign-in link (plan §1.15). Transactional and single-purpose: no offers,
 * no newsletter copy, nothing to make a spam filter reconsider it. The
 * unsubscribe footer still goes on because the same address is on the list.
 */
export function magicLinkEmail(input: {
  site: SiteKey;
  url: string;
  unsubscribeUrl?: string;
}): EmailBody {
  const config = getSite(input.site);
  const subject = `Your sign-in link — ${config.name}`;
  const html = layout(
    input.site,
    'Sign in',
    [
      p('Here is your sign-in link. It works once and expires in 30 minutes.'),
      p(
        `<a href="${esc(input.url)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Sign me in</a>`,
      ),
      p('If you did not ask to sign in, ignore this email — the link does nothing on its own.'),
    ],
    input.unsubscribeUrl ?? `${siteOrigin(input.site)}/unsubscribe`,
  );
  const text = `Here is your sign-in link for ${config.name}. It works once and expires in 30 minutes.

${input.url}

If you did not ask to sign in, ignore this email — the link does nothing on its own.`;
  return { subject, html, text };
}

/** Sent once, when a subscription first makes someone an Insider. */
export function insiderWelcomeEmail(input: {
  site: SiteKey;
  name?: string | null;
  membersUrl: string;
  unsubscribeUrl: string;
}): EmailBody {
  const config = getSite(input.site);
  const greeting = input.name ? `Hi ${input.name},` : 'Hi,';
  const subject = `You're in — ${config.name} Insider`;
  const html = layout(
    input.site,
    'Welcome to Insider',
    [
      p(esc(greeting)),
      p(
        'Your membership is active. Everything you have access to is in your account, and new updates land there as they are published.',
      ),
      p(
        `<a href="${esc(input.membersUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">Open your account</a>`,
      ),
      p('No password to remember — ask for a sign-in link any time.'),
    ],
    input.unsubscribeUrl,
  );
  const text = `${greeting}

Your ${config.name} Insider membership is active.

Open your account: ${input.membersUrl}

No password to remember — ask for a sign-in link any time.`;
  return { subject, html, text };
}
