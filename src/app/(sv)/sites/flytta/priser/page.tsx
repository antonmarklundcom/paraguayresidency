import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AfterYouMessage,
  Band,
  Breadcrumbs,
  Button,
  Container,
  Eyebrow,
  Guarantee,
  Heading,
  HeroContact,
  LeadPanel,
  PriceTable,
  SectionHeader,
  CompareTable,
  Testimonials,
  CaseSnapshots,
  TrustBar,
  FromPrice,
} from '@/components';
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

const EXTRAS = [
  {
    id: 'tax_residency',
    title: 'Skatterättslig vägledning och RUC',
    href: '/skatt',
    fee: <FromPrice site={SITE} route="tax_residency" />,
    body: 'Vi går igenom RUC-registreringen och samordnar den med din ansökan när den behövs. Din egen rådgivare bedömer frågor om svensk utflyttning och anknytning.',
  },
  {
    id: 'family',
    title: 'Familjeansökan',
    href: '/familj',
    fee: <FromPrice site={SITE} route="family" />,
    body: 'Dokumentlistan för partner och barn, med vigselbevis, födelsebevis och samtycken när de behövs. Offerten anger vilka personer som omfattas.',
  },
] as const;

export default function Page() {
  return (
    <>
      <Band tone="default" className="!pb-[var(--space-8)]">
        <Container width="narrow">
          <Breadcrumbs site={SITE} items={[{ label: 'Priser', href: PATH }]} />
          <Eyebrow className="mt-[var(--space-8)]">Priser</Eyebrow>
          <Heading level={1} className="mt-[var(--space-4)]">
            Ett fast arvode, med separata kostnader förklarade innan du bestämmer dig
          </Heading>
          <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">
            Offerten börjar med ett meddelande till oss — på WhatsApp eller i formuläret — om ditt
            medborgarskap, dina dokument, din väg och dina resplaner. Vi kommer överens om arbetet
            och det fasta arvodet skriftligt innan du bestämmer dig. Det finns ingen automatisk
            kalkylator: dokumenten och vilka som ansöker avgör omfattningen.
          </p>
          <div data-service-cta className="mt-[var(--space-6)] flex flex-wrap items-center gap-[var(--space-3)]">
            <HeroContact site={SITE} fallbackHref="#inquiry" />
            <Button href="/route-finder" variant="secondary">Hitta din väg</Button>
          </div>
        </Container>
      </Band>
      <TrustBar site={SITE} />


      <PriceTable site={SITE} tone="alt" />

      <Band tone="default" labelledBy="extras-title">
        <SectionHeader id="extras-title" eyebrow="Vid behov" title="Två saker som ofta hör ihop med ansökan" />
        <ul className="mt-12 grid gap-8 md:grid-cols-2">
          {EXTRAS.map((extra) => (
            <li key={extra.id} id={extra.id} className="border-t-2 border-[var(--accent)] pt-5">
              <h3 className="font-[family-name:var(--display-font)] text-(length:--step-2) leading-tight">
                <Link href={extra.href} className="underline-offset-4 hover:underline">{extra.title}</Link>
              </h3>
              <p className="mt-3 font-medium">
                Arvode för tjänsten: {extra.fee}
              </p>
              <p className="mt-3 text-[var(--fg-muted)]">{extra.body}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="alt" labelledBy="terms-title" data-fee-terms>
        <SectionHeader id="terms-title" eyebrow="Vad som gäller" title="Vad varje arvode täcker, och vad det aldrig gör" />
        <dl className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
          <div>
            <dt className="font-semibold">Vad arvodet täcker</dt>
            <dd className="mt-2 text-[var(--fg-muted)]">
              Den överenskomna förberedelsen, samordningen och vägledningen för din väg. Skriftligt
              går vi först igenom dina svenska dokument och vad du redan har ordnat.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Vad som aldrig ingår</dt>
            <dd className="mt-2 text-[var(--fg-muted)]">
              Myndighetsavgifter, apostiller och nödvändiga översättningar ingår aldrig i vårt
              arvode. Vi listar dokumentkostnaderna för just din ansökan innan du bestämmer dig.
              Resa och boende betalar du också separat.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Vad du betalar till staten och till oss</dt>
            <dd className="mt-2 text-[var(--fg-muted)]">
              Du betalar tillämpliga officiella ansökningsavgifter direkt till paraguayanska
              staten. Du betalar oss för förberedelsen och samordningen som beskrivs här.
              Apostiller och översättningar betalas separat till dem som utför arbetet.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Skatt och RUC</dt>
            <dd className="mt-2 text-[var(--fg-muted)]">
              Din egen skatterådgivares arbete betalas separat. För RUC bekräftar vi skriftligt om
              någon officiell registreringsavgift gäller.
            </dd>
          </div>
        </dl>
        <p className="mt-10">
          <Link href="/uppehallstillstand" className="font-medium text-[var(--accent)] underline underline-offset-4">
            Investor Pass hanteras av vårt systervarumärke med egen omfattning och offert. Läs om Investor Pass och de andra vägarna.
          </Link>
        </p>
      </Band>
      <CompareTable site={SITE} />
      <Testimonials site={SITE} tone="alt" />
      <CaseSnapshots site={SITE} />

      <Guarantee site={SITE} />
      <AfterYouMessage site={SITE} tone="alt" />

      <LeadPanel
        site={SITE}
        id="inquiry"
        variant="consultation"
        title="Få din skriftliga offert"
        intro="Berätta om ditt medborgarskap, din väg och din tidsplan. Skriftligt bekräftar vi omfattningen och beskriver sedan arvodet och de separata kostnaderna innan du bestämmer dig."
        whatsappMessage="Hej! Jag vill ha en skriftlig offert för att flytta till Paraguay."
        pagePath={PATH}
      />
    </>
  );
}
