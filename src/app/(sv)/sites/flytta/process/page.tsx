import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/process';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Så går processen till — uppehållstillstånd i Paraguay steg för steg',
    description:
      'Från första samtalet till cédulan i handen: processen för uppehållstillstånd i Paraguay, steg för steg, med dokumentchecklistan.',
    path: PATH,
  });
}

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '1. Samtalet',
    body: 'Vi går igenom din faktiska situation — medborgarskap, familj, tidsram — och säger vilken väg som passar innan något bokas.',
  },
  {
    title: '2. Din dokumentlista',
    body: 'Byggd efter svenska myndigheter, i den ordning handlingarna faktiskt behövs. Vi säger vilket dokument du ska börja med, eftersom det oftast är det som tar längst tid.',
  },
  {
    title: '3. Apostille och auktoriserad översättning',
    body: 'Sekvenserat så att inget hinner bli för gammalt innan mötet det hör till. Det här är där de flesta förseningar uppstår när ingen håller ordningen — vi håller den åt dig.',
  },
  {
    title: '4. Veckan i Asunción',
    body: 'Möten hos migrationsmyndigheten, biometri, hälsokontroll och bank ligger bokade innan du landar. Reser ni som familj samordnar vi allas ärenden till samma vecka där myndigheten tillåter det.',
  },
  {
    title: '5. Beslut och cédulan',
    body: 'När uppehållstillståndet är beviljat följer cédulan. Vi håller dig uppdaterad på vägen i stället för att lova ett datum vi inte kan garantera.',
  },
  {
    title: '6. Vad som händer sedan',
    body: 'Tillfälligt uppehållstillstånd löper sin tid, och de flesta ansöker sedan om permanent. Har du kapital att investera tittar vi i stället på Investor Pass tillsammans med dig.',
  },
];

const DOCUMENT_CHECKLIST = [
  'Födelsebevis, apostillerat',
  'Utdrag ur belastningsregistret, apostillerat',
  'Underlag för försörjning (varierar med väg — vi säger vad som gäller för din)',
  'Auktoriserad översättning av varje handling som inte är på spanska',
  'Giltigt pass under hela processen',
  'Vigselbevis och barnens dokument, om ni ansöker som familj',
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site={SITE} items={[{ label: 'Process', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Vad som faktiskt händer, steg för steg
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Inget steg här är dolt tills du betalat för det. Så här går hela processen till, i den
          ordning den faktiskt körs.
        </p>

        <ol className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          {STEPS.map((step) => (
            <li key={step.title} className="border-l-2 border-[var(--accent)] pl-[var(--space-6)]">
              <Heading level={3}>{step.title}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--space-16)]">
          <Heading level={2}>Dokumentchecklistan, i korthet</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Den generella versionen, för att orientera dig. Din riktiga checklista byggs efter din
            situation — se{' '}
            <a href="/uppehallstillstand" className="text-[var(--accent)] underline underline-offset-2">
              vägarna till uppehållstillstånd
            </a>
            .
          </p>
          <ul className="mt-[var(--space-6)] list-disc space-y-[var(--space-2)] pl-6 text-[var(--fg-muted)]">
            {DOCUMENT_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          Tillfälligt uppehållstillstånd gäller <Fact k="temporary.duration" site={SITE} />, och
          cédulan är <Fact k="cedula.timeline" site={SITE} />. Redo att börja?{' '}
          <a href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            Hör av dig
          </a>{' '}
          eller ta{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Route Finder
          </a>{' '}
          först.
        </p>
      </Container>
    </Section>
  );
}
