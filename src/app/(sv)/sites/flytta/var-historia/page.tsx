import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, Button, Container, Heading, Prose, Section, StatRow } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';

const SITE = 'flytta' as const;
const PATH = '/var-historia';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Vår historia — varför vi flyttade till Paraguay',
    description:
      'Varför vi lämnade Sverige för Paraguay, vad som var svårare än väntat, och vad vi skulle gjort annorlunda.',
    path: PATH,
  });
}

const STATS = [
  { value: '2022', label: 'Första resan hit' },
  { value: 'Asunción', label: 'Bor vi' },
  { value: 'Svenska', label: 'Hela vägen' },
];

/**
 * The one page on the whole platform written in first person plural (plan
 * §6.8 quality bar — "personal-story voice; first person plural is allowed
 * here and nowhere else"). Adapted from Anton's own "Om mig" on
 * `antonmarklundcom/flyttatillparaguay` (plan §12.4) to the consolidated
 * lead-gen model: the story stays personal, but filing itself is done by
 * "vårt team i Asunción", not by Anton alone (registry `siblings`, home hero).
 */
export default function Page() {
  const whatsapp = whatsappHref('Hej! Jag läste er historia och vill veta mer om att flytta till Paraguay.');

  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site={SITE} items={[{ label: 'Vår historia', href: PATH }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>Vi flyttade till Paraguay. Så här gick det till.</Heading>
        </header>

        <Prose className="mt-[var(--space-12)]">
          <h2>Hur vi hamnade i Paraguay</h2>
          <p>
            Vi kom hit första gången utan någon plan alls. Vi hade läst oss till namnet i en tråd om
            länder där man fortfarande kan äga mark utan att ha ärvt den, och tänkte stanna några
            veckor. Det vi hittade var inte det tropiska vykortet — det var röd jord, långa varma
            eftermiddagar, folk som satt utanför sina hus när solen gick ner, och priser som fick
            oss att räkna om två gånger.
          </p>
          <p>
            Det som fick oss att stanna var inte kostnadsläget i sig. Det var att vi för första
            gången på flera år kände att vi hade tid. I Sverige hade allt vi ville göra ett steg
            före sig: ett tillstånd, en kö, en kalkyl som ändå inte gick ihop. Här kunde vi bestämma
            något på måndagen och ha börjat på onsdagen.
          </p>

          <h2>Uppehållstillståndet — den långsamma vägen</h2>
          <p>
            Vår egen ansökan gjordes på det dummaste sättet som finns: på egen hand, utan att kunna
            spanska ordentligt, med dokument hämtade i fel ordning. Vi beställde papper hemma i
            Sverige månader innan de skulle användas, apostillerade fel handling, missade att en
            översättning måste vara gjord av auktoriserad översättare, och stod till slut i fel kö
            på fel våning med en handläggare som mycket vänligt förklarade att vi fick komma
            tillbaka.
          </p>
          <p>
            Det kostade oss en extra resa och några månader extra. Det gav oss också, i efterhand,
            hela anledningen till den här sajten. Allt vi gjorde fel gick att undvika med en lista
            och någon som varit i rummet förut — så nu är vi det för andra svenskar.
          </p>

          <h2>Familjen och att bli kvar på riktigt</h2>
          <p>
            Ungefär samtidigt byggde vi ett liv här på riktigt: ett hushåll, vänner, en vardag som
            inte längre kändes tillfällig. Det är genom det vi lärt oss det som inte står i någon
            guide — hur man faktiskt pratar med en myndighetsperson, varför söndagens asado inte är
            ett kalas utan en institution, och att familj här ofta betyder betydligt fler än fyra
            personer.
          </p>
          <p>
            Det är också det som gjorde att vi slutade se Paraguay som ett projekt och började se
            det som ett liv. Vi är inte digitala nomader som råkar vara här. Vi bor här, betalar
            hyra här och står i samma köer som alla andra.
          </p>

          <h2>Varför vi skriver om det</h2>
          <p>
            Efter att vi delat vår egen process började andra svenskar höra av sig — först några
            som läst en kommentar i ett forum, sedan deras vänner. Ganska snabbt insåg vi två saker:
            att informationen på svenska var i princip obefintlig, och att den engelskspråkiga
            informationen ofta kom från personer som aldrig satt sin fot i landet.
          </p>
          <p>
            Den här sajten är det vi själva hade velat läsa innan vi åkte — även de delar som inte
            är säljande. Själva ansökan sköts numera av{' '}
            <Link href="/">vårt team i Asunción</Link>, med en jurist på plats och allt förklarat på
            svenska, så att du slipper göra samma misstag vi gjorde.
          </p>

          <h2>Vad vi inte är</h2>
          <p>
            Vi är inte jurister, inte skatterådgivare och inte mäklare. Det juridiska hanteras av
            vår lokala jurist i Asunción, skattefrågor hör hemma hos din egen rådgivare och
            Skatteverket (se <Link href="/skatt">skatt</Link>), och vi säger hellre det rakt ut än
            låtsas kunna svara på allt.
          </p>
        </Prose>

        <div className="mt-[var(--space-12)]">
          <StatRow stats={STATS} />
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap items-center gap-[var(--space-4)]">
          <Button href="/uppehallstillstand">Se vägarna till uppehållstillstånd</Button>
          <Button href="/route-finder" variant="secondary">
            Hitta din väg
          </Button>
          {whatsapp && (
            <a
              href={whatsapp}
              rel="noopener"
              className="text-[var(--text-sm)] text-[var(--accent)] underline underline-offset-2"
            >
              Eller skriv till oss på WhatsApp
            </a>
          )}
        </div>
      </Container>
    </Section>
  );
}
