import type { Metadata } from 'next';
import { StatRow } from '@/components';
import { TopicPage } from '../_lib/TopicPage';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'flytta' as const;
const PATH = '/kostnader';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Vad kostar det att flytta till och leva i Paraguay?',
    description:
      'Verkliga kostnadsnivåer för boende, mat, transport och uppehållstillstånd i Paraguay, uppskattning 2026 — och vad som faktiskt drar ner kostnaden mest.',
    path: PATH,
  });
}

const STATS = [
  { value: '≈ 40 %', label: 'Lägre kostnadsläge', note: 'Jämfört med vår egen budget i Sverige, uppskattning 2026' },
  { value: '7 dagar', label: 'Ungefärlig tid på plats', note: 'För det första besöket' },
  { value: '0', label: 'Språkkrav', note: 'Inget spanskprov för uppehållstillstånd' },
];

const FAQ = [
  {
    question: 'Är siffrorna på den här sidan officiella?',
    answer:
      'Nej. De är vår egen budget och vad vi hör från andra svenskar här, avrundade och märkta som uppskattningar för 2026. Din egen kostnadsbild beror på var du bor, vilken standard du väljer och hur du lever — vi jämför gärna mot din faktiska budget på ett samtal.',
  },
  {
    question: 'Vad kostar själva ansökan om uppehållstillstånd?',
    answer:
      'Vårt arvode ser du på prissidan. Utöver det tillkommer myndighetsavgifter, apostiller och auktoriserade översättningar i Sverige, samt resa och boende under veckan på plats. Vi lägger aldrig påslag på tredjepartskostnader, och du får en fullständig totalsumma innan något startar.',
  },
  {
    question: 'Är det billigare att bo utanför Asunción?',
    answer:
      'Ofta ja, särskilt för boende. Städer som Areguá och San Bernardino ligger nära huvudstaden men med lägre hyresnivå, medan Encarnación och Ciudad del Este passar bättre om du jobbar mot gränsen. Vilken stad som passar dig är en av de vanligaste frågorna vi får — läs våra ortsprofiler eller fråga oss direkt.',
  },
];

export default function Page() {
  return (
    <TopicPage
      crumbLabel="Kostnader"
      title="Vad det faktiskt kostar"
      intro="Siffrorna nedan är vår egen budget och vad vi hör från andra svenskar här, inte officiell statistik — märkta som uppskattningar, aldrig som fasta priser."
      faq={FAQ}
      serviceName="Kostnadsgenomgång inför flytt till Paraguay"
      serviceDescription="Genomgång av verkliga kostnadsnivåer i Paraguay och vad ett uppehållstillstånd kostar, anpassat efter din situation."
      path={PATH}
    >
      <StatRow stats={STATS} />

      <h2>Boende</h2>
      <p>
        Hyra är det som skiljer sig mest mellan städer och områden. Ett normalt tvårumslägenhet i
        centrala Asunción kostar mer än motsvarande i Areguá eller San Bernardino — uppskattning
        2026, och vi jämför gärna mot din faktiska budget på ett samtal snarare än en generell
        siffra här.
      </p>

      <h2>Vardagskostnader</h2>
      <p>
        Mat, transport och hushållshjälp ligger genomgående lägre än i Sverige. Närproducerat kött
        och grönsaker på de lokala marknaderna är ofta billigare än importerat och paketerat i
        stormarknaden — vår egen vana är att handla mer lokalt ju längre vi bott här.
      </p>

      <h2>Vad ansökan kostar utöver vårt arvode</h2>
      <p>
        Myndighetsavgifter, apostille av dina svenska dokument och auktoriserad översättning till
        spanska är kostnader som tillkommer utöver vårt arvode, och de varierar med antal
        dokument och vilket land du apostillerar i. Vi listar dem specifikt för din situation innan
        du bestämmer dig — se{' '}
        <a href="/priser">priser</a> för hur paketen är uppbyggda.
      </p>

      <h2>Vad som drar ner kostnaden mest</h2>
      <p>
        Att bo utanför Asunción, laga mat själv med lokala råvaror och vänta med bilköp tills du
        vet var du landar är de tre sakerna som gjort störst skillnad för vår egen budget. Ingen av
        dem är unik för oss — de flesta svenskar vi pratar med landar på samma slutsats efter ett
        halvår här.
      </p>
    </TopicPage>
  );
}
