import type { Metadata } from 'next';
import { Disclaimer, Fact } from '@/components';
import { TopicPage } from '../_lib/TopicPage';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/skatt';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Skatt i Paraguay för svenskar — territoriell skatt och svensk utflyttning',
    description:
      'Hur paraguayansk territoriell skatt fungerar, och varför den inte automatiskt löser din svenska skattefråga. Stäm alltid av med en skatterådgivare.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'Betyder paraguayansk residency att jag slipper svensk skatt?',
    answer:
      'Nej, inte automatiskt. Ett uppehållstillstånd i ett annat land ändrar ingenting i sig — det är utflyttning och väsentlig anknytning till Sverige som avgör, och den bedömningen görs av Skatteverket, inte av oss. Många kombinerar en verklig flytt med residencyn, andra behåller full svensk skattskyldighet och skaffar uppehållstillstånd av helt andra skäl.',
  },
  {
    question: 'Vad är väsentlig anknytning?',
    answer:
      'Det är den svenska regel som avgör om du fortfarande räknas som skatterättsligt bosatt i Sverige efter en flytt — bostad, familj och ekonomiska intressen som finns kvar väger in. Det är en fråga för en skatterådgivare som känner din helhet, inte något vi kan svara på generellt.',
  },
  {
    question: 'Hur fungerar skatten i Paraguay?',
    answer:
      'Paraguay beskattar territoriellt: i huvudsak den inkomst som uppstår i landet. Vad det betyder för din egen inkomst och ditt eget upplägg beror på var pengarna faktiskt kommer ifrån, och det går vi igenom med dig snarare än att generalisera.',
  },
];

export default function Page() {
  return (
    <TopicPage
      crumbLabel="Skatt"
      title="Skatten, sagt ärligt"
      intro="Paraguay beskattar territoriellt — det ändrar hur din utländska inkomst behandlas här. Det säger ingenting om vad Skatteverket tycker om din utflyttning, och de två frågorna blandas ihop hela tiden."
      faq={FAQ}
      serviceName="Skatterättslig vägledning inför flytt till Paraguay"
      serviceDescription="Genomgång av paraguayansk territoriell skatt och RUC-registrering inför en flytt eller ett uppehållstillstånd i Paraguay."
      path={PATH}
    >
      <h2>Två separata frågor som blandas ihop</h2>
      <p>
        Den ena frågan är vad Paraguay tar ut i skatt. Den andra är om du fortfarande räknas som
        skattskyldig i Sverige. De avgörs av helt olika myndigheter, efter helt olika regler, och en
        lösning på den ena löser inte automatiskt den andra.
      </p>

      <h2>Skattesystemet i Paraguay</h2>
      <p>
        <Fact k="tax.foreign_income_treatment" site={SITE} />. Paraguay är känt för ett enkelt,
        lågt system snarare än ett komplicerat — men &ldquo;territoriellt&rdquo; är inte samma sak
        som &ldquo;skattefritt&rdquo;, och den skillnaden är värd att förstå innan du planerar din
        ekonomi kring den.
      </p>

      <h2>Utflyttning och väsentlig anknytning — den svenska sidan</h2>
      <p>
        Att bli utskriven ur Sverige och bedömd som inte längre väsentligt anknuten är en process
        Skatteverket sköter, med sina egna kriterier: bostad, familj, verksamhet och ekonomiska
        intressen som finns kvar hemma. Vi känner processen från utsidan — vi har själva gått igenom
        den — men den slutliga bedömningen är alltid svensk, aldrig paraguayansk.
      </p>
      <Disclaimer>
        Det här är ingen skatterådgivning. Stäm alltid av din egen situation med en
        skatterådgivare innan du fattar beslut som rör svensk eller paraguayansk skatt.
      </Disclaimer>

      <h2>RUC och tax-registrering i Paraguay</h2>
      <p>
        Vill du driva verksamhet eller öppna bankkonto i Paraguay registrerar vi ditt RUC-nummer som
        en del av processen. Det är ett administrativt steg, inte i sig ett bevis på skatterättslig
        hemvist i något land.
      </p>
    </TopicPage>
  );
}
