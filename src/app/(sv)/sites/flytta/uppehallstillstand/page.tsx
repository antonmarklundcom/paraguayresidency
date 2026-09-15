import type { Metadata } from 'next';
import { Fact } from '@/components';
import { TopicPage } from '../_lib/TopicPage';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const SITE = 'flytta' as const;
const PATH = '/uppehallstillstand';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Uppehållstillstånd i Paraguay — tillfälligt, permanent och Investor Pass',
    description:
      'De tre vägarna till uppehållstillstånd i Paraguay: tillfälligt, permanent och Investor Pass för dig med kapital att investera. Vad var och en kräver.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'Vilken väg ska jag välja?',
    answer:
      'De flesta börjar med tillfälligt uppehållstillstånd och går över till permanent. Har du kapital att investera kan Investor Pass ta dig direkt till permanent status. Ta Route Finder-testet eller skriv till oss, så säger vi vilken väg som passar din situation.',
  },
  {
    question: 'Måste jag bo i Paraguay på heltid?',
    answer:
      'Nej. Du behöver komma hit för mötena, men full flytt är ditt eget val. Permanent uppehållstillstånd har ett närvarokrav du bör känna till innan du planerar din tid utomlands.',
  },
  {
    question: 'Kan jag byta väg senare?',
    answer:
      'Ja, det vanliga mönstret är just tillfälligt följt av permanent. Investor Pass är ett separat spår med sin egen investeringströskel, och vi går igenom om det passar bättre för dig innan något lämnas in.',
  },
];

export default function Page() {
  return (
    <TopicPage
      crumbLabel="Uppehållstillstånd"
      title="Tre vägar till uppehållstillstånd — vilken passar dig?"
      intro="De flesta börjar med tillfälligt uppehållstillstånd och går vidare till permanent. Har du kapital att investera finns en snabbare väg. Vi säger vilken som passar innan du bestämmer dig."
      faq={FAQ}
      serviceName="Uppehållstillstånd i Paraguay"
      serviceDescription="Ansökan om tillfälligt eller permanent uppehållstillstånd i Paraguay, förberedd och inlämnad åt dig."
      path={PATH}
    >
      <h2>Tillfälligt uppehållstillstånd — det vanliga första steget</h2>
      <p>
        Tillfälligt uppehållstillstånd gäller <Fact k="temporary.duration" site={SITE} />. Du
        lämnar in en gång, lever med kortet under den tiden och ansöker sedan om permanent status.
        Det är den väg de allra flesta av dem vi hjälper väljer — enkel att förstå, och tillräckligt
        snabb för de flesta situationer.
      </p>

      <h2>Permanent uppehållstillstånd</h2>
      <p>
        Det permanenta kortet har lång giltighet, men <Fact k="permanent.presence_rule" site={SITE} />.
        Det är den regel folk oftast får fel, så vi går igenom exakt vad den betyder för ditt eget
        resmönster innan du planerar något efter den.
      </p>

      <h2>Investor Pass — snabbaste vägen till permanent</h2>
      <p>
        Har du kapital att sätta in i en kvalificerande investering finns Investor Pass, som ger
        permanent uppehållstillstånd utan det tillfälliga mellansteget. Det sköts av vårt
        systervarumärke{' '}
        <a href={siteOrigin('investorpass')} rel="noopener">
          Paraguay Investor Pass
        </a>{' '}
        — samma team, egen sajt, eftersom programmet riktar sig till en annan typ av sökande och
        vänder sig till ett annat belopp.
      </p>

      <h2>Cédulan efter beviljad ansökan</h2>
      <p>
        När uppehållstillståndet är beviljat följer din cédula — det riktiga id-kortet du använder
        för bankkonto, hyreskontrakt och sjukvård. Den är <Fact k="cedula.timeline" site={SITE} />,
        och vi håller dig uppdaterad snarare än att lova ett datum vi inte kan hålla.
      </p>
    </TopicPage>
  );
}
