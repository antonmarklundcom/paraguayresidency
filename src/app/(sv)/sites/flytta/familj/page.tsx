import type { Metadata } from 'next';
import { TopicPage } from '../_lib/TopicPage';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/familj';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Flytta till Paraguay med familj — barn, partner och skola',
    description:
      'Att söka uppehållstillstånd i Paraguay som familj: vilka dokument barn och partner behöver, och vad som är annorlunda mot att söka ensam.',
    path: PATH,
  });
}

const FAQ = [
  {
    question: 'Vilka dokument behöver barnen?',
    answer:
      'Födelsebevis, apostillerat, och om bara en vårdnadshavare flyttar med barnet ofta ett samtycke från den andra föräldern. Vi ger den exakta listan för er familjs situation innan resan bokas, eftersom den skiljer sig beroende på vårdnadsform.',
  },
  {
    question: 'Måste vi resa samtidigt?',
    answer:
      'Nej, men vi samordnar ansökningarna så att hela hushållet går igenom myndigheterna under samma resa om ni kan. Det sparar både tid och en andra resa till Paraguay.',
  },
  {
    question: 'Vad gäller för sambo eller ogift partner?',
    answer:
      'Vigselbevis krävs för make eller maka. Är ni sambo utan vigsel går ni oftast igenom processen som två separata ansökningar snarare än en familjeansökan — vi säger exakt vad det betyder för er innan ni bestämmer er.',
  },
];

export default function Page() {
  return (
    <TopicPage
      crumbLabel="Familj"
      title="Att göra det här som familj"
      intro="Partner och barn under 18 ansöker parallellt med dig men behöver egna dokument. Samordnat rätt går hela hushållet igenom myndigheterna på samma resa."
      faq={FAQ}
      serviceName="Familjeansökan för uppehållstillstånd i Paraguay"
      serviceDescription="Samordnad ansökan om uppehållstillstånd för partner och barn tillsammans med den sökande."
      path={PATH}
    >
      <h2>Vad som är annorlunda mot att söka ensam</h2>
      <p>
        Grundprocessen är densamma, men varje medföljande behöver sina egna dokument: vigselbevis
        för partner, födelsebevis och eventuella samtycken för barn under 18 — alla apostillerade i
        Sverige innan ni reser. Missar man ordningen här är det den vanligaste anledningen till att
        en familjs ansökan blir försenad.
      </p>

      <h2>Barn under 18</h2>
      <p>
        Barnens ansökningar löper parallellt med föräldrarnas. Om bara en förälder flyttar med
        barnet krävs vanligtvis ett skriftligt samtycke från den andra, apostillerat på samma sätt
        som övriga dokument. Vi ger listan specifikt för er vårdnadsform.
      </p>

      <h2>En resa istället för flera</h2>
      <p>
        Vi bokar myndighetsbesöken för hela hushållet under samma vecka i Asunción där myndigheten
        tillåter det, så att ni slipper en andra resa bara för att ett barns ärende hamnade i en
        annan kö.
      </p>

      <h2>Skola och sjukvård efter ankomst</h2>
      <p>
        När cédulan väl är på plats hjälper vi er vidare med kontakter för skola och sjukvård —
        inget vi själva erbjuder som tjänst, men något vi delar med varje familj som frågar,
        eftersom vi själva gick igenom exakt samma sak.
      </p>
    </TopicPage>
  );
}
