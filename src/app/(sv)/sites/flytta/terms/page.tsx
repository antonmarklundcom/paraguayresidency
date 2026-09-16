import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { getSite } from '@/sites/registry';

/** Swedish terms body — standalone, same reasoning as the privacy page. */
export function generateMetadata(): Metadata {
  const config = getSite('flytta');
  return siteMetadata('flytta', {
    title: `Användarvillkor — ${config.name}`,
    description: `Villkoren för ${config.name}s tjänster kring uppehållstillstånd och flytt till Paraguay.`,
    path: '/terms',
  });
}

export default function Page() {
  const config = getSite('flytta');
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Användarvillkor</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Uppdaterad 2026-09-16.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>Vad vi erbjuder</h2>
          <p>
            {config.name} förbereder och lämnar in ansökningar om uppehållstillstånd, cédula och
            skatterättslig hemvist i Paraguay å dina vägnar. Vi offererar ett fast arvode för ditt
            specifika ärende innan något arbete påbörjas, baserat på informationen du lämnar.
          </p>
          <h2>Vad vi inte kan garantera</h2>
          <p>
            Vi förbereder och lämnar in ditt ärende korrekt och komplett. Beslutet att bevilja en
            ansökan fattas enbart av Paraguays migrationsmyndighet, och ingen tjänsteleverantör
            kan garantera utfallet eller tidsramen för ett myndighetsbeslut. Vi säger till ärligt
            när något i ditt ärende avviker från det vanliga, istället för att lova ett resultat
            vi inte styr över.
          </p>
          <h2>Arvode</h2>
          <p>
            Det offererade arvodet täcker vårt förberedelse- och inlämningsarbete enligt ditt
            avtal. Myndighetsavgifter, portokostnader, apostille och auktoriserad översättning
            från tredje part faktureras separat och redovisas innan de uppstår.
          </p>
          <h2>Juridisk och skatterättslig rådgivning</h2>
          <p>
            Vi är en ansökningstjänst, inte en advokatbyrå eller revisionsbyrå. När en fråga
            faktiskt kräver juridisk eller skatterättslig rådgivning specifik för din situation —
            inklusive din svenska deklaration — säger vi det och hänvisar dig till en kvalificerad
            rådgivare, istället för att svara själva.
          </p>
          <h2>Ändringar</h2>
          <p>
            Vi kan uppdatera dessa villkor allt eftersom våra tjänster förändras. Den version som
            gäller är den som publicerats här vid den tidpunkt du anlitar oss.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
