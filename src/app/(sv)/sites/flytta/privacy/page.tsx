import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { getSite } from '@/sites/registry';

/**
 * Swedish privacy body (footer/sitemap already link here). Not built from
 * `src/lib/legal-pages.tsx` — that shared component is English prose, same
 * reasoning as residenciapt's standalone page.
 */
export function generateMetadata(): Metadata {
  const config = getSite('flytta');
  return siteMetadata('flytta', {
    title: `Integritetspolicy — ${config.name}`,
    description: `Hur ${config.name} samlar in, använder och skyddar informationen du delar med oss.`,
    path: '/privacy',
  });
}

export default function Page() {
  const config = getSite('flytta');
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Integritetspolicy</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Uppdaterad 2026-09-16.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>Vad vi samlar in</h2>
          <p>
            När du fyller i ett formulär hos {config.name} — en konsultationsförfrågan, ett
            kontaktmeddelande, en prenumeration på nyhetsbrevet, eller ett svar från
            route-findern — samlar vi in det du anger: namn, e-post, telefon eller WhatsApp,
            land, nationalitet och meddelande. Vi registrerar också vilken sida du skickade från
            och, där du samtyckt, hur du hittade oss första gången, så att vi vet vad som
            faktiskt fungerar.
          </p>
          <h2>Hur vi använder det</h2>
          <p>
            För att svara på din fråga, förbereda din dokumentchecklista och ansökan om du
            anlitar oss, och skicka de e-postmeddelanden du rimligen kan förvänta dig — en
            bekräftelse, ett svar, en uppdatering om ditt ärende. Vi säljer aldrig din
            information.
          </p>
          <h2>Vem mer ser den</h2>
          <p>
            Din förfrågan registreras först i vår egen databas och vidarebefordras till vårt CRM
            (VenderCRM) så att teamet kan följa upp. E-post skickas via Resend eller vår egen
            e-postserver. Om CRM:et skulle vara nere når din förfrågan oss ändå — den försvinner
            aldrig i väntan på en tredje part.
          </p>
          <h2>Nyhetsbrev</h2>
          <p>
            Prenumerationer på nyhetsbrevet använder dubbel bekräftelse: du bekräftar via e-post
            innan du läggs till, och varje utskick har en avregistreringslänk som tar bort dig
            direkt.
          </p>
          <h2>Dina rättigheter</h2>
          <p>
            Du kan fråga oss vad vi har om dig, be oss rätta det, eller be oss radera det, genom
            att skriva till oss via <a href="/contact">kontaktsidan</a>. Vi har ännu ingen
            automatiserad självbetjäningsfunktion för det — en förfrågan till en riktig person
            besvaras av en riktig person.
          </p>
          <h2>Cookies</h2>
          <p>
            Vi använder ett fåtal egna cookies för att spara dina svar i route-findern under din
            session och för att registrera hur du hittade oss första gången. Vi använder inga
            tredjeparts annonsspårare.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
