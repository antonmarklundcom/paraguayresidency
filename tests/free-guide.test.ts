import { describe, expect, it } from 'vitest';
import { getPages } from '@/content';
import { freeGuideChapters, FREE_GUIDE_READ_PATH } from '@/lib/free-guide';
import { leadAutoReply } from '@/lib/email-templates';

describe('free Spanish guide (residenciaes lead magnet)', () => {
  it('loads its chapters in order with valid frontmatter', () => {
    const chapters = freeGuideChapters();
    expect(chapters.length).toBe(5);
    expect(chapters.map((c) => c.frontmatter.title)).toEqual(
      chapters.map((_, i) => expect.stringMatching(new RegExp(`^Capítulo ${i + 1}: `))),
    );
    expect(chapters.every((c) => c.body.length > 1000)).toBe(true);
  });

  it('is never listed as a public /guias page', () => {
    expect(getPages('residenciaes').some((page) => page.slugPath.includes('guia-gratis'))).toBe(false);
  });

  it('sends the reading link in Spanish to a lead from the guide form', () => {
    const mail = leadAutoReply({ site: 'residenciaes', name: 'Ana', pagePath: '/guia-gratis', unsubscribeUrl: 'https://x.test/u' });
    expect(mail.subject).toContain('guía gratis');
    expect(mail.text).toContain(`https://residenciaenparaguay.es${FREE_GUIDE_READ_PATH}`);
    expect(mail.html).toContain('Darse de baja');
  });

  it('answers other Spanish leads in Spanish without the guide link', () => {
    const mail = leadAutoReply({ site: 'residenciaes', pagePath: '/contact', unsubscribeUrl: 'https://x.test/u' });
    expect(mail.subject).toContain('Recibimos tu consulta');
    expect(mail.text).not.toContain(FREE_GUIDE_READ_PATH);
  });

  it('leaves the English auto-reply unchanged', () => {
    const mail = leadAutoReply({ site: 'residency', pagePath: '/guia-gratis', unsubscribeUrl: 'https://x.test/u' });
    expect(mail.subject).toContain('We have your enquiry');
    expect(mail.html).toContain('Unsubscribe');
  });
});
