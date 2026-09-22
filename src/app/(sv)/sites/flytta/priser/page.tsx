import type { Metadata } from 'next';
import { Breadcrumbs, Button, StickyCta, Container, Fact, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/priser';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Priser — uppehållstillstånd i Paraguay',
    description:
      'Vad en väg till uppehållstillstånd i Paraguay brukar kosta, uppdelat på hur mycket du gör själv — fast pris per väg, bekräftat innan du bestämmer dig.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="flytta" items={[{ label: 'Priser', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">Ett fast arvode, med separata kostnader förklarade innan du bestämmer dig</Heading>
        <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">Offerten börjar med ett samtal om ditt medborgarskap, dina dokument, din väg och dina resplaner. Vi kommer överens om arbetet och det fasta arvodet innan du bestämmer dig. Det finns ingen automatisk kalkylator: dokumenten och vilka som ansöker avgör omfattningen.</p>
        <div data-service-cta className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]"><Button href="#inquiry">Hör av dig</Button><Button href="/route-finder" variant="secondary">Hitta din väg</Button></div>
        <section data-fee-terms className="mt-[var(--space-8)] rounded-[var(--radius-brand)] bg-[var(--surface-alt)] p-[var(--space-6)]"><Heading level={2}>Vad varje arvode täcker</Heading><p className="mt-[var(--space-4)]">Den överenskomna förberedelsen, samordningen och vägledningen för din väg, enligt beskrivningen nedan.</p><dl className="mt-[var(--space-4)] space-y-[var(--space-4)]"><div><dt className="font-semibold">Vad som aldrig ingår</dt><dd>Myndighetsavgifter, apostiller och nödvändiga översättningar ingår aldrig i vårt arvode. Vi listar dokumentkostnaderna för just din ansökan innan du bestämmer dig. Resa och boende betalar du också separat.</dd></div><div><dt className="font-semibold">Vad du betalar till staten och till oss</dt><dd>Du betalar tillämpliga officiella ansökningsavgifter direkt till paraguayanska staten. Du betalar oss för förberedelsen och samordningen som beskrivs här. Apostiller och översättningar betalas separat till dem som utför arbetet.</dd></div></dl><p className="mt-[var(--space-4)]">Din egen skatterådgivares arbete betalas separat. För RUC bekräftar vi på samtalet om någon officiell registreringsavgift gäller.</p></section>
        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="temporary">
          <Heading level={2} id="temporary"><a href="/uppehallstillstand" className="text-[var(--accent)] underline">Tillfälligt uppehållstillstånd</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Arvode för tjänsten: <Fact k="pricing.temporary" site="flytta" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">Vad det fasta arvodet täcker</dt><dd>Vi tar fram dokumentlistan för ditt medborgarskap, förbereder ansökan och samordnar myndighetsbesöken i Asunción för inlämningen.</dd></div>
            <div><dt className="font-semibold">Så tar vi fram offerten</dt><dd>På samtalet går vi igenom dina svenska dokument och vad du redan har ordnat. Därefter offererar vi förberedelsen och inlämningen.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="permanent">
          <Heading level={2} id="permanent"><a href="/uppehallstillstand" className="text-[var(--accent)] underline">Permanent uppehållstillstånd</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Arvode för tjänsten: <Fact k="pricing.permanent" site="flytta" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">Vad det fasta arvodet täcker</dt><dd>Vi förbereder och lämnar in ansökan om permanent uppehållstillstånd när du kvalificerar dig. Vi går igenom närvarokravet utifrån ditt resmönster.</dd></div>
            <div><dt className="font-semibold">Så tar vi fram offerten</dt><dd>På samtalet går vi igenom din nuvarande status och när du kan ansöka. Den permanenta ansökan offereras separat från en tidigare tillfällig ansökan.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="cedula">
          <Heading level={2} id="cedula"><a href="/uppehallstillstand" className="text-[var(--accent)] underline">Cédula de identidad</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Arvode för tjänsten: <Fact k="pricing.cedula" site="flytta" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">Vad det fasta arvodet täcker</dt><dd>Vi samordnar cédulaansökan efter att uppehållstillståndet beviljats och håller dig uppdaterad om nästa steg. Omfattningen bekräftas tillsammans med din övriga ansökan.</dd></div>
            <div><dt className="font-semibold">Så tar vi fram offerten</dt><dd>På samtalet kontrollerar vi var du är i processen och om cédulan redan omfattas av din offert, så att samma arbete inte offereras igen.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="tax_residency">
          <Heading level={2} id="tax_residency"><a href="/skatt" className="text-[var(--accent)] underline">Skatterättslig vägledning och RUC</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Arvode för tjänsten: <Fact k="pricing.tax_residency" site="flytta" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">Vad det fasta arvodet täcker</dt><dd>Vi går igenom RUC-registreringen och samordnar den med din ansökan när den behövs. Vi förklarar vilka frågor som behöver tas vidare till din egen skatterådgivare.</dd></div>
            <div><dt className="font-semibold">Så tar vi fram offerten</dt><dd>På samtalet går vi igenom din planerade verksamhet och behovet av RUC. Din egen rådgivare bedömer frågor om svensk utflyttning och anknytning.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="family">
          <Heading level={2} id="family"><a href="/familj" className="text-[var(--accent)] underline">Familjeansökan</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Arvode för tjänsten: <Fact k="pricing.family" site="flytta" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">Vad det fasta arvodet täcker</dt><dd>Vi tar fram dokumentlistan för partner och barn, inklusive vigselbevis, födelsebevis och samtycken när de behövs. Vi samordnar myndighetsbesöken under samma resa där myndigheten tillåter det.</dd></div>
            <div><dt className="font-semibold">Så tar vi fram offerten</dt><dd>På samtalet går vi igenom varje familjemedlem och vårdnadsformen. Offerten anger vilka personer som omfattas och arvodet för medföljande, tillsammans med huvudansökan.</dd></div>
          </dl>
        </section>

        <p className="mt-[var(--space-8)]"><a href="/uppehallstillstand" className="text-[var(--accent)] underline">Investor Pass hanteras av vårt systervarumärke med egen omfattning och offert. Läs om Investor Pass och de andra vägarna.</a></p>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Få din skriftliga offert</Heading>
          <p className="mt-[var(--space-4)]">Berätta om ditt medborgarskap, din väg och din tidsplan. Under samtalet bekräftar vi omfattningen och beskriver sedan arvodet och de separata kostnaderna skriftligt innan du bestämmer dig.</p>
          <div className="mt-[var(--space-6)]"><Button href="/contact">Boka ett samtal</Button></div>
          <div className="mt-[var(--space-8)]"><LeadForm site="flytta" variant="consultation" pagePath={PATH} /></div>
        </div>
      <StickyCta formId="inquiry" label="Hör av dig" />
      </Container>
    </Section>
  );
}
