import { describe, expect, it } from 'vitest';
import { leadAutoReply, subscribeConfirmEmail } from '@/lib/email-templates';
import { SITE_KEYS, getSite } from '@/sites/registry';

/**
 * O26 bug 2: Portuguese and Swedish leads got an English auto-reply, and every
 * non-Spanish footer said "Unsubscribe". The newsletter confirmation was
 * English for every brand.
 */
const URL = 'https://x.test/u';
const ENGLISH = /\b(We have your enquiry|A person reads|The team at|Confirm your subscription|One click to confirm|If you did not ask)\b/;

describe('visitor emails are in the brand language', () => {
  it('pt-BR auto-reply and footer are Portuguese', () => {
    const mail = leadAutoReply({ site: 'residenciapt', name: 'João', pagePath: '/contato', unsubscribeUrl: URL });
    expect(mail.subject).toContain('Recebemos');
    expect(mail.html).toContain('Olá, João');
    expect(mail.html).toContain('Cancelar inscrição');
    expect(mail.html + mail.text + mail.subject).not.toMatch(ENGLISH);
    expect(mail.html).not.toContain('Unsubscribe');
  });

  it('sv auto-reply and footer are Swedish', () => {
    const mail = leadAutoReply({ site: 'flytta', name: 'Anna', unsubscribeUrl: URL });
    expect(mail.text.startsWith('Hej Anna,')).toBe(true);
    expect(mail.html).toContain('Avsluta prenumerationen');
    expect(mail.html + mail.text + mail.subject).not.toMatch(ENGLISH);
    expect(mail.html).not.toContain('Unsubscribe');
  });

  it('English brands keep the English auto-reply', () => {
    const mail = leadAutoReply({ site: 'investorpass', unsubscribeUrl: URL });
    expect(mail.subject).toBe('We have your enquiry — Paraguay Investor Pass');
    expect(mail.html).toContain('Unsubscribe');
  });

  it('the subscription confirmation is localised for every non-English brand', () => {
    const footer = { es: 'Darse de baja', pt: 'Cancelar inscrição', sv: 'Avsluta prenumerationen' } as const;
    for (const site of SITE_KEYS) {
      const { locale } = getSite(site);
      const mail = subscribeConfirmEmail({ site, confirmUrl: 'https://x.test/c?t=1', unsubscribeUrl: URL });
      expect(mail.text).toContain('https://x.test/c?t=1');
      if (locale === 'en') {
        expect(mail.subject).toMatch(/^Confirm your subscription/);
        continue;
      }
      expect(mail.html + mail.text + mail.subject, site).not.toMatch(ENGLISH);
      expect(mail.html, site).toContain(footer[locale]);
    }
  });
});
