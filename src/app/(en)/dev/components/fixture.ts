import type { Proof } from '@content/shared/proof';

/**
 * DEV AND TESTS ONLY — fictional placeholder data for laying out the proof
 * components on /dev/components (which 404s in production) and in
 * tests/proof.test.ts. Every value here is made up and labelled as such.
 * Never import this from a real page: real proof lives in
 * content/shared/proof.ts and is filled in by Anton.
 */
export const PROOF_FIXTURE: Proof = {
  stats: {
    residenciesFiled: 123,
    yearsInBusiness: 4,
    googleRating: { rating: 4.8, count: 56, url: 'https://example.com/fixture-reviews' },
  },
  team: [
    {
      key: 'anton',
      // A placeholder picture (not a face) to show the photo slot's crop.
      photo: { src: '/images/arrival/guide-tile-documents-desk-800.webp', width: 800, height: 1000 },
      languages: ['sv', 'en', 'es'],
      bio: {
        en: 'Fixture bio: one or two plain sentences about the person, written by Anton.',
        es: 'Biografía de prueba: una o dos frases sencillas sobre la persona, escritas por Anton.',
        pt: 'Biografia de teste: uma ou duas frases simples sobre a pessoa, escritas por Anton.',
        sv: 'Testbiografi: en eller två enkla meningar om personen, skrivna av Anton.',
      },
    },
    { key: 'yanina', photo: null, languages: ['es', 'en'], bio: { en: null, es: null, pt: null, sv: null } },
    { key: 'diana', photo: null, languages: ['es', 'pt'], bio: { en: null, es: null, pt: null, sv: null } },
  ],
  reviews: [
    {
      quote: 'Fixture review, for layout only. A real quote goes here, in the words the client wrote, trimmed but never rewritten.',
      locale: 'en',
      name: 'Sample A.',
      countryCode: 'GB',
      route: 'temporary',
      month: '2026-05',
      source: 'google',
      url: 'https://example.com/fixture-review',
      permission: true,
      translations: {
        es: 'Reseña de prueba, solo para el diseño. Aquí va una cita real, con las palabras del cliente.',
        pt: 'Avaliação de teste, só para o layout. Aqui entra uma citação real, com as palavras do cliente.',
        sv: 'Testomdöme, bara för layouten. Här står ett riktigt citat, med kundens egna ord.',
      },
    },
    {
      quote: 'Reseña de prueba, solo para el diseño. Una cita real irá aquí, tal como la escribió el cliente.',
      locale: 'es',
      name: 'Muestra B.',
      countryCode: 'ES',
      route: 'permanent',
      month: '2026-07',
      source: 'whatsapp',
      permission: true,
    },
    {
      quote: 'Avaliação de teste, só para o layout. Uma citação real entra aqui, do jeito que o cliente escreveu.',
      locale: 'pt',
      name: 'Exemplo C.',
      countryCode: 'BR',
      route: 'cedula',
      month: '2026-08',
      source: 'email',
      permission: true,
    },
    {
      quote: 'Testomdöme, bara för layouten. Ett riktigt citat hamnar här, precis som kunden skrev det.',
      locale: 'sv',
      name: 'Exempel D.',
      countryCode: 'SE',
      route: 'temporary',
      month: '2026-06',
      source: 'video',
      url: 'https://example.com/fixture-video',
      permission: true,
    },
    {
      quote: 'A second fixture review, so an English brand shows a grid of three rather than a lone card.',
      locale: 'en',
      name: 'Sample E.',
      countryCode: 'US',
      route: 'investor_pass',
      month: '2026-04',
      source: 'email',
      permission: true,
    },
  ],
  cases: [
    { countryCode: 'GB', route: 'temporary', weeks: 9, month: '2026-06', permission: true, outcome: { en: 'Fixture case: temporary residency approved.', es: 'Caso de prueba: residencia temporal aprobada.', pt: 'Caso de teste: residência temporária aprovada.', sv: 'Testfall: tillfälligt uppehållstillstånd beviljat.' } },
    { countryCode: 'SE', route: 'cedula', weeks: 3, month: '2026-05', permission: true, outcome: { en: 'Fixture case: cédula issued.', sv: 'Testfall: cédula utfärdad.' } },
  ],
  office: {
    address: 'Fixture address, line one\nAsunción, Paraguay',
    mapsUrl: 'https://example.com/fixture-map',
    photos: [
      {
        src: '/images/arrival/investorpass-tile-productive-business-800.webp',
        width: 800,
        height: 1000,
        alt: { en: 'Fixture photo', es: 'Foto de prueba', pt: 'Foto de teste', sv: 'Testbild' },
      },
      {
        src: '/images/arrival/guide-tile-terere-cafe-800.webp',
        width: 800,
        height: 1000,
        alt: { en: 'Fixture photo', es: 'Foto de prueba', pt: 'Foto de teste', sv: 'Testbild' },
      },
      {
        src: '/images/arrival/guide-tile-market-asuncion-800.webp',
        width: 800,
        height: 1000,
        alt: { en: 'Fixture photo', es: 'Foto de prueba', pt: 'Foto de teste', sv: 'Testbild' },
      },
    ],
  },
  credentials: [],
  press: [],
  guarantee: {
    en: 'Fixture guarantee: Anton writes the real wording, if he decides to offer one.',
    es: 'Garantía de prueba: Anton redacta el texto real, si decide ofrecerla.',
    pt: 'Garantia de teste: Anton escreve o texto real, se decidir oferecê-la.',
    sv: 'Testgaranti: Anton skriver den riktiga formuleringen, om han väljer att erbjuda en.',
  },
};
