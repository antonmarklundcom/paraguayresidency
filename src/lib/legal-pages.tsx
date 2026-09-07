import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { getSite, type SiteKey } from '@/sites/registry';

/**
 * Generic privacy/terms bodies every brand's footer already links to (plan
 * §6.1). One shared shape, the brand name interpolated — S4/S5/S10-S15 reuse
 * this rather than five near-identical copies (plan §4 restraint baseline).
 */

export function privacyMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: `Privacy Policy — ${getSite(site).name}`,
    description: `How ${getSite(site).name} collects, uses and protects the information you share with us.`,
    path: '/privacy',
  });
}

export function PrivacyPage({ site }: { site: SiteKey }) {
  const config = getSite(site);
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Privacy Policy</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Last updated 2026-09-07.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>What we collect</h2>
          <p>
            When you submit a form on {config.name} — a consultation request, a contact message, a
            newsletter sign-up, or the Route Finder — we collect the details you provide: your
            name, email, phone or WhatsApp number, country, nationality and message. We also
            record which page you submitted from and, where consented, first-touch attribution
            (how you found us) so we can tell what is actually working.
          </p>
          <h2>How we use it</h2>
          <p>
            To respond to your enquiry, to prepare your document checklist and filing if you
            engage us, and to send the emails you would reasonably expect — a confirmation, a
            reply, an update on your case. We do not sell your information.
          </p>
          <h2>Who else sees it</h2>
          <p>
            Your enquiry is recorded in our own database first, and forwarded to our CRM
            (VenderCRM) so our team can follow up. Emails are sent through Resend or our own mail
            server. If the CRM is unavailable, your enquiry still reaches us — it is never lost
            waiting on a third party.
          </p>
          <h2>Newsletter</h2>
          <p>
            Newsletter sign-ups use double opt-in: you confirm by email before you are added, and
            every email carries an unsubscribe link that removes you immediately.
          </p>
          <h2>Your rights</h2>
          <p>
            You can ask us what we hold about you, ask us to correct it, or ask us to delete it, by
            writing to us through the <a href="/contact">contact page</a>. We do not have an
            automated self-service deletion tool yet; a request to a real person is answered by a
            real person.
          </p>
          <h2>Cookies</h2>
          <p>
            We use a small number of first-party cookies to keep the Route Finder&apos;s answers
            during your session and to record how you first found us. We do not run third-party
            advertising trackers.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}

export function termsMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: `Terms of Service — ${getSite(site).name}`,
    description: `The terms that apply when you engage ${getSite(site).name} for residency, cédula or tax filing services.`,
    path: '/terms',
  });
}

export function TermsPage({ site }: { site: SiteKey }) {
  const config = getSite(site);
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Terms of Service</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Last updated 2026-09-07.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>What we provide</h2>
          <p>
            {config.name} prepares and files Paraguay residency, cédula and tax residency
            applications on your behalf. We quote a fixed fee for your specific case before any
            work begins, based on the information you give us.
          </p>
          <h2>What we cannot guarantee</h2>
          <p>
            We prepare and file your case correctly and completely. The decision to approve any
            application is Paraguay&apos;s immigration authority&apos;s alone, and no service
            provider can guarantee the outcome or the timing of a government decision. We tell you
            honestly when something in your case is unusual rather than promising an outcome we do
            not control.
          </p>
          <h2>Fees</h2>
          <p>
            The fee we quote you covers our preparation and filing work as described on your
            engagement. Government fees, courier costs, apostille and translation costs charged by
            third parties are separate and disclosed before they are incurred.
          </p>
          <h2>Legal and tax advice</h2>
          <p>
            We are a residency filing service, not a law firm or an accountancy practice. Where a
            question genuinely needs legal or tax advice specific to your situation, we say so and
            point you to a qualified professional rather than answering it ourselves.
          </p>
          <h2>Changes</h2>
          <p>
            We may update these terms as our services change. The version in force is the one
            published here at the time you engage us.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}

/**
 * The Guide sells a digital product, not a filing service — reusing
 * `TermsPage` verbatim would describe government fees and application filing
 * that never happen here, so it gets its own terms rather than an inaccurate
 * shared one (still one shared shape, per the §4 restraint baseline).
 */
export function guideTermsMetadata(site: SiteKey): Metadata {
  return siteMetadata(site, {
    title: `Terms of Service — ${getSite(site).name}`,
    description: `The terms that apply when you buy the ${getSite(site).name} digital guide.`,
    path: '/terms',
  });
}

export function GuideTermsPage({ site }: { site: SiteKey }) {
  const config = getSite(site);
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Terms of Service</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Last updated 2026-09-07.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>What you are buying</h2>
          <p>
            {config.name} sells a digital guide (PDF) delivered instantly by download link after
            payment, plus free content updates for 12 months from your purchase date. It is
            information, written by people who file Paraguay residency cases every week — it is
            not legal or tax advice, and it does not include filing your case for you.
          </p>
          <h2>Delivery</h2>
          <p>
            Your download link is emailed immediately after payment and shown on the confirmation
            page. It expires after a limited time and a limited number of downloads; save the file
            once you have it. If a link stops working within the update period, contact us and we
            reissue it.
          </p>
          <h2>Refunds</h2>
          <p>
            See our <a href="/refunds">refund policy</a>: a 14-day, no-questions refund from the
            date of purchase.
          </p>
          <h2>Accuracy and limits</h2>
          <p>
            We keep the guide current and correct as far as we are able, and every legal or
            financial figure in it is treated the same way as on this site: hedged until our legal
            partner has verified it. Paraguayan law and procedure can change, and your own
            circumstances may differ from the examples in the guide. Where your case needs advice
            specific to you, engage a qualified professional or our done-for-you service rather
            than relying on the guide alone.
          </p>
          <h2>Changes</h2>
          <p>
            We may update these terms as the product changes. The version in force is the one
            published here at the time of your purchase.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
