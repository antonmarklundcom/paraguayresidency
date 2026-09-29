import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AfterYouMessage,
  ArticleCards,
  Band,
  Button,
  Disclosure,
  Eyebrow,
  Fact,
  FAQ,
  Guarantee,
  Heading,
  HeroContact,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  PriceTable,
  Section,
  SectionHeader,
  TeamSection,
  TrustBar,
  heroTrust,
} from '@/components';
import { curatedArticles } from '@/lib/curated-articles';
import { siteMetadata } from '@/lib/metadata';
import { t } from '@/i18n';

const SITE = 'residenciapt' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.metaTitle'),
    description: t(SITE, 'home.metaDescription'),
    path: '/',
  });
}

const FAQ_ITEMS = [
  {
    question: 'Como sei qual rota serve para o meu caso?',
    answer:
      'Faça o teste de rota — seis perguntas, dois minutos — ou escreva para a gente e dizemos direto, inclusive quando a rota padrão não serve para o seu caso. Para quem tem nacionalidade de um país do Mercosul, a rota Mercosul costuma ser o ponto de partida.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Um honorário fixo por rota, cotado por escrito antes de você decidir, mais as taxas oficiais, que vão direto ao Estado paraguaio. A página de preços mostra o que cada rota cobre e o que fica de fora.',
  },
  {
    question: 'Preciso me mudar para o Paraguai para ter a residência?',
    answer:
      'Não. Você precisa comparecer às consultas presencialmente, que agendamos juntos, mas a mudança completa é decisão sua, não uma exigência da própria residência.',
  },
  {
    question: 'O Paraguai é "imposto zero"?',
    answer:
      'Não vendemos essa ideia. O Paraguai tributa por sistema territorial — é diferente de isenção total, e explicamos exatamente o que isso significa na página de residência fiscal.',
  },
];

const link = 'text-[var(--accent)] underline underline-offset-2';
const label = 'text-(length:--step--2) font-medium uppercase tracking-[.16em] text-[var(--fg-muted)]';

/** The everyday-life pieces ("mais nesta edição"), each one ending in the same next step. */
const LIFE_INDEX = [
  { slugPath: 'morar-no-paraguai/vale-a-pena-morar-no-paraguai', note: 'A pergunta que todo mundo faz primeiro' },
  { slugPath: 'morar-no-paraguai/saude-e-escola-para-brasileiros-no-paraguai', note: 'Escola e saúde para quem vem com a família' },
  { slugPath: 'morar-no-paraguai/fronteira-ciudad-del-este-e-foz-do-iguacu', note: 'Viver de um lado, trabalhar do outro' },
  { slugPath: 'morar-no-paraguai/aposentado-brasileiro-no-paraguai', note: 'Aposentadoria: o que muda e o que não muda' },
  { slugPath: 'morar-no-paraguai/transferir-dinheiro-do-brasil-para-o-paraguai', note: 'Como levar o dinheiro sem dor de cabeça' },
  { slugPath: 'morar-no-paraguai/comprar-imovel-ou-terra-no-paraguai', note: 'Imóvel e terra: o que um estrangeiro pode' },
  { slugPath: 'morar-no-paraguai/carro-brasileiro-no-paraguai', note: 'Levar o carro brasileiro' },
  { slugPath: 'impostos/impostos-no-paraguai-e-a-sua-declaracao-no-brasil', note: 'Imposto de renda no Brasil: a pergunta é para o contador' },
] as const;

export default function Page() {
  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <HeroContact site={SITE} fallbackHref="#contact" />
    </>
  );

  const cities = curatedArticles(SITE, [
    { slugPath: 'cidades/melhores-cidades-para-morar-no-paraguai', eyebrow: 'Cidades' },
    { slugPath: 'cidades/morar-em-assuncao', eyebrow: 'Assunção' },
    { slugPath: 'cidades/morar-em-encarnacion', eyebrow: 'Encarnación' },
  ]);
  const business = curatedArticles(SITE, [
    { slugPath: 'negocios/abrir-empresa-no-paraguai-sendo-brasileiro', eyebrow: 'Negócios' },
    { slugPath: 'negocios/empresa-paraguaia-prestando-servicos-para-o-brasil', eyebrow: 'Negócios' },
    { slugPath: 'negocios/existe-mei-no-paraguai', eyebrow: 'Negócios' },
  ]);
  const lifeLinks = LIFE_INDEX.flatMap((item) => {
    const [post] = curatedArticles(SITE, [{ slugPath: item.slugPath }]);
    return post ? [{ ...item, title: post.title, href: post.href }] : [];
  });

  return (
    <>
      <PhotoHero
        layout="split"
        image="residenciapt-hero-family-veranda-terere"
        locale="pt"
        focus="45% center"
        video={{ id: 'residenciapt-hero-family-veranda-terere' }}
        eyebrow="Vida no Paraguai"
        title="Morar no Paraguai começa pela residência."
        sub={t(SITE, 'home.sub')}
        actions={actions}
        trust={heroTrust(SITE)}
      />

      <TrustBar site={SITE} />

      <IntentTiles
        locale="pt"
        title="Nesta edição: a vida do outro lado da fronteira"
        intro="Por onde a maioria dos brasileiros começa: quanto custa, como é a fronteira, qual é a rota. Na dúvida, o teste de rota responde em dois minutos."
        tiles={[
          { label: 'Quanto custa morar aqui', note: 'Aluguel, mercado e família', href: '/custo-de-vida', image: 'residenciapt-tile-feira-ciudad-del-este' },
          { label: 'Fronteira e Mercosul', note: 'O que simplifica para brasileiros', href: '/mercosul', image: 'residenciapt-tile-ponte-rio-fronteira' },
          { label: 'Qual rota é a minha?', note: 'Seis perguntas, dois minutos', href: '/route-finder', image: 'residenciapt-tile-bifurcacao-estrada-terra' },
          { label: 'Documentos, na ordem certa', note: 'Da certidão à cédula', href: '/guias/documentos', image: 'residenciapt-tile-documentos-terere-mesa' },
        ]}
      />

      <Band tone="alt" labelledBy="custo-title" data-cost-of-living>
        <SectionHeader
          id="custo-title"
          eyebrow="Custo de vida"
          title="Quanto custa viver aqui, com a fonte à vista"
          intro="Números de Assunção, com a origem de cada um. Cidade, estilo de vida e tamanho da família mudam a conta; por isso a resposta que serve para você a gente dá por escrito."
          aside={<Link href="/custo-de-vida" className={`inline-flex min-h-11 items-center gap-2 font-medium ${link}`}>Custo de vida completo <span aria-hidden="true">→</span></Link>}
        />
        <dl className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--border)] shadow-[var(--elev-1)] md:mt-16 md:grid-cols-3">
          <div className="bg-[var(--surface)] p-6 md:p-8">
            <dt className={label}>Aluguel</dt>
            <dd className="mt-3 leading-relaxed first-letter:uppercase"><Fact k="costofliving.rent" site={SITE} /></dd>
          </div>
          <div className="bg-[var(--surface)] p-6 md:p-8">
            <dt className={label}>Mercado e restaurante</dt>
            <dd className="mt-3 leading-relaxed first-letter:uppercase"><Fact k="costofliving.groceries" site={SITE} /></dd>
          </div>
          <div className="bg-[var(--surface)] p-6 md:p-8">
            <dt className={label}>Família</dt>
            <dd className="mt-3 leading-relaxed first-letter:uppercase"><Fact k="costofliving.monthly_family" site={SITE} /></dd>
          </div>
        </dl>
        <p className="mt-8 max-w-[62ch] text-(length:--step--1) text-[var(--fg-muted)]">
          Gostou da conta? O primeiro passo é a residência, e ela começa com uma mensagem.{' '}
          <Link href="/route-finder" className={link}>Descubra sua rota</Link>.
        </p>
      </Band>

      <ArticleCards
        site={SITE}
        title="Onde morar"
        articles={cities}
        more={{ href: '/guias/cidades', label: 'Todas as cidades' }}
      />

      <ArticleCards
        site={SITE}
        tone="alt"
        title="Trabalhar e abrir empresa"
        articles={business}
        more={{ href: '/guias/negocios', label: 'Todos os guias de negócios' }}
      />

      <Band labelledBy="mercosul-title" data-mercosul-block>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div>
            <Eyebrow>Rota Mercosul</Eyebrow>
            <h2 id="mercosul-title" className="mt-4 font-[family-name:var(--display-font)] text-(length:--step-4) leading-[1.06] text-balance">
              Brasileiro tem um caminho mais curto.
            </h2>
            <p className="mt-5 max-w-[52ch] text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
              A nacionalidade brasileira dá acesso à residência Mercosul. Ela tem prazo rígido para virar permanente, e é justamente aí que muita gente tropeça. A gente marca as datas com você desde o começo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/mercosul">Ver a rota Mercosul</Button>
              <Button href="/guias/documentos/quanto-custa-a-residencia-no-paraguai" variant="secondary">Quanto custa, em reais</Button>
            </div>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--border)] shadow-[var(--elev-1)]">
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>A rota</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="mercosur.residency_route" site={SITE} /></dd>
            </div>
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>Taxa oficial, em reais</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="fees.residency_brl" site={SITE} /></dd>
            </div>
            <div className="bg-[var(--surface)] p-6 md:p-8">
              <dt className={label}>O prazo que não pode passar</dt>
              <dd className="mt-2 leading-relaxed first-letter:uppercase"><Fact k="mercosur.conversion_deadline" site={SITE} /></dd>
            </div>
          </dl>
        </div>
      </Band>

      <PriceTable
        site={SITE}
        tone="alt"
        routes={['temporary', 'permanent', 'cedula']}
        title="Honorário fixo por rota, por escrito antes de começar"
        intro="Você sabe o que paga antes de começar. As taxas oficiais vão direto ao Estado e ficam detalhadas à parte, então nada fica escondido no nosso honorário."
      />

      <AfterYouMessage site={SITE} />

      {lifeLinks.length > 0 && (
        <Band tone="alt" labelledBy="mais-title" data-life-index>
          <SectionHeader
            id="mais-title"
            eyebrow="Mais nesta edição"
            title="A vida prática, uma pergunta de cada vez"
            intro="Saúde, escola, dinheiro, imóvel, imposto. Cada texto responde primeiro e explica depois."
          />
          <ol className="mt-12 grid gap-x-12 md:mt-16 md:grid-cols-2">
            {lifeLinks.map((item, index) => (
              <li key={item.href} className="border-t border-[var(--border)]">
                <Link href={item.href} className="group flex min-h-11 items-start gap-5 py-6 focus-visible:outline-2 focus-visible:outline-offset-2">
                  <span aria-hidden="true" className="font-[family-name:var(--font-mono)] text-(length:--step--2) tracking-[.1em] text-[var(--fg-muted)] pt-1.5">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0">
                    <span className="block font-[family-name:var(--display-font)] text-(length:--step-1) leading-snug text-balance group-hover:text-[var(--accent)]">{item.title}</span>
                    <span className="mt-1 block text-(length:--step--1) text-[var(--fg-muted)]">{item.note}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Band>
      )}

      <TeamSection site={SITE} />

      <Guarantee site={SITE} tone="alt" />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">Os detalhes</Heading>
        <Disclosure title="Para quem é">
          <p>
            Brasileiro pensando em uma vida no Paraguai — custo de vida, negócio, terra, proximidade
            da fronteira ou um ritmo mais calmo. Quem já tem nacionalidade de um país do Mercosul e
            quer saber se isso simplifica o processo. E quem só quer entender, sem promessa vazia,
            o que muda na declaração do Brasil. Se você não sabe em qual desses grupos se encaixa,
            o <Link href="/route-finder" className={link}>teste de rota</Link> diz em dois minutos.
          </p>
        </Disclosure>
        <Disclosure title="Residência permanente e Investor Pass">
          <p>
            A <Link href="/residencia/permanente" className={link}>residência permanente</Link> vem
            depois da temporária, com regra de presença — a gente explica. Quem investe capital pode
            ir direto à permanente pelo <Link href="/investor-pass" className={link}>Investor Pass</Link>,
            com o mesmo time.
          </p>
        </Disclosure>
        <Disclosure title="Passo a passo e custos">
          <p>
            O caminho inteiro, do cartório no Brasil à cédula paraguaia, está em{' '}
            <Link href="/guias/documentos/como-tirar-residencia-no-paraguai" className={link}>como tirar residência no Paraguai</Link>.
            As taxas oficiais, as certidões e o câmbio em reais estão em{' '}
            <Link href="/guias/documentos/quanto-custa-a-residencia-no-paraguai" className={link}>quanto custa a residência no Paraguai</Link>.
          </p>
        </Disclosure>
        <Disclosure title="Perguntas frequentes">
          <FAQ items={FAQ_ITEMS} />
        </Disclosure>
      </Section>

      {/* Depoimentos ficam de fora até existirem depoimentos reais (plano §7, §6.1). */}

      <LeadPanel
        site={SITE}
        variant="contact"
        title="Pronto para descobrir sua rota?"
        intro="Conte seu caso em duas linhas. Dizemos qual rota serve, quais documentos você precisa e quanto custa — ou que é melhor esperar, se for o caso."
        whatsappMessage="Olá — tenho uma dúvida sobre residência no Paraguai."
      />
    </>
  );
}
