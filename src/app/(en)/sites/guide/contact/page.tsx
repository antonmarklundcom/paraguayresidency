import type { Metadata } from 'next';
import { contactMetadata } from '@/lib/conversion-pages';
import { RichContactPage } from '@/lib/contact-rich';

const SITE = 'guide' as const;

export function generateMetadata(): Metadata {
  return contactMetadata(SITE);
}

export default function Page() {
  return (
    <RichContactPage
      site={SITE}
      checklist={[
        'The email you bought with, if it is about your purchase or access.',
        'The chapter or page, if you think something is out of date or wrong.',
        'For a refund: just say so within 14 days of buying, no reason needed.',
      ]}
      aside={
        <p className="mt-[var(--space-6)] text-(length:--text-sm) text-[var(--fg-muted)]">
          See the <a href="/refunds" className="text-[var(--accent)] underline underline-offset-2">refund policy</a>, or{' '}
          <a href="/#price" className="text-[var(--accent)] underline underline-offset-2">what is in the guide</a>. Want the team to file your case instead?{' '}
          <a href="https://paraguayresidency.co.uk/contact" rel="noopener" className="text-[var(--accent)] underline underline-offset-2">Message the service team</a>.
        </p>
      }
    />
  );
}
