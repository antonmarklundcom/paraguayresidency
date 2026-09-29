import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';
import { RichContactPage } from '@/lib/contact-rich';

const SITE = 'residency' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return (
    <RichContactPage
      site={SITE}
      after
      checklist={[
        'Your passport nationality, and where you live now.',
        'The route you have in mind, or "not sure": we will tell you which fits.',
        'When you could be in Asunción for the appointments.',
        'Anyone applying with you, and any record or unusual document you already know about.',
      ]}
      aside={
        <p className="mt-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)]">
          Not ready to write? Try the <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">Route Finder</a>{' '}
          or see <a href="/pricing" className="text-[var(--accent)] underline underline-offset-2">what each route costs</a>. Applying from the UK? Read about the{' '}
          <a href="/guides/documents/uk-police-certificate-acro-for-paraguay" className="text-[var(--accent)] underline underline-offset-2">ACRO police certificate</a>{' '}
          first.
        </p>
      }
    />
  );
}
