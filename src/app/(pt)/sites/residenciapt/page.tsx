import { getPages } from '@/content';
import { contentHref } from '@/lib/site-pages';
import type { Metadata } from 'next';
import {
  ArticleCards,
  Button,
  Disclosure,
  Fact,
  FAQ,
  Heading,
  IntentTiles,
  LeadPanel,
  PhotoHero,
  heroTrust,
  Reasons,
  Section,
  Steps,
  TeamStrip,
} from '@/components';
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
      'Faça o teste de rota — seis perguntas, dois minutos — ou escreva para a gente e dizemos direto, inclusive quando a rota padrão não serve para o seu caso.',
  },
  {
    question: 'Quanto custa?',
    answer:
      'Um honorário fixo por rota, cotado em reais ou dólares antes de você decidir, de acordo com sua nacionalidade e situação. Veja a página de preços para o que cada rota cobre.',
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

const STEPS = [
  { title: 'Uma mensagem', body: 'Confirmamos sua rota e seu honorário fixo por escrito, antes de você decidir qualquer coisa.' },
  { title: 'Seus documentos', body: 'Checklist pela sua nacionalidade, com a legalização na ordem certa.' },
  { title: 'Assunção', body: 'Protocolamos o processo e acompanhamos você nas consultas. Você vem; nós fazemos o resto.' },
  { title: 'Sua cédula', body: 'Com a residência aprovada, cuidamos da cédula paraguaia e dizemos o que vem depois.' },
];

export default function Page() {
  const latest = getPages(SITE).slice(0, 3);
  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <Button href="#contact" variant="secondary">
        {t(SITE, 'home.ctaSecondary')}
      </Button>
    </>
  );

  return (
    <>
      <PhotoHero
        image="frontier-hero-red-earth-road"
        locale="pt"
        position="upper-left"
        eyebrow="Vida no Paraguai"
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={actions}
        trust={heroTrust(SITE)}
      />

      <IntentTiles
        locale="pt"
        title="Por onde você começa?"
        intro="Escolha seu ponto de partida. Na dúvida, o teste de rota responde em dois minutos."
        tiles={[
          { label: 'Qual rota é a minha?', note: 'Seis perguntas, dois minutos', href: '/route-finder', image: 'guide-tile-route-fork' },
          { label: 'Rota Mercosul', note: 'O que simplifica para brasileiros', href: '/mercosul', image: 'frontier-tile-three-roads' },
          { label: 'Residência temporária', note: 'O primeiro passo padrão', href: '/residencia/temporaria', image: 'guide-tile-documents-desk' },
          { label: 'Custo de vida', note: 'O que custa morar aqui', href: '/custo-de-vida', image: 'guide-tile-market-asuncion' },
        ]}
      />

      <Reasons
        title="Por que o Paraguai"
        intro="Sem promessa vazia: o que a regra diz hoje, confirmado com você antes de protocolar qualquer coisa."
        reasons={[
          { title: 'Um primeiro passo claro', body: <>Prazo da residência temporária: <Fact k="temporary.duration" site={SITE} />.</> },
          { title: 'O cartão que fica', body: <>A residência permanente tem uma exigência de presença: <Fact k="permanent.presence_rule" site={SITE} />.</> },
          {
            title: 'Tributação territorial',
            body: (
              <>
                Sobre a renda do exterior: <Fact k="tax.foreign_income_treatment" site={SITE} />, mas o que
                muda na sua declaração no Brasil é pergunta para o seu contador.
              </>
            ),
          },
          {
            title: 'Custo de vida',
            body: (
              <>
                <Fact k="costofliving.overview" site={SITE} />. Veja o detalhe em{' '}
                <a href="/custo-de-vida" className="text-[var(--accent)] underline underline-offset-2">custo de vida</a>.
              </>
            ),
          },
        ]}
      />

      <Steps
        tone="alt"
        title="Como funciona"
        intro="Quatro passos, na ordem em que acontecem de verdade."
        steps={STEPS}
        link={{ href: '/processo', label: 'O processo completo, passo a passo' }}
      />

      <TeamStrip site={SITE} />

      <Section width="narrow">
        <Heading level={2} className="mb-[var(--space-6)]">Os detalhes</Heading>
        <Disclosure title="Para quem é">
          <p>
            Brasileiro pensando em uma vida no Paraguai — custo de vida, negócio, terra, proximidade
            da fronteira ou um ritmo mais calmo. Quem já tem nacionalidade de um país do Mercosul e
            quer saber se isso simplifica o processo. E quem só quer entender, sem promessa vazia,
            o que muda na declaração do Brasil. Se você não sabe em qual desses grupos se encaixa,
            o{' '}
            <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
              teste de rota
            </a>{' '}
            diz em dois minutos.
          </p>
        </Disclosure>
        <Disclosure title="Residência permanente e Investor Pass">
          <p>
            A{' '}
            <a href="/residencia/permanente" className="text-[var(--accent)] underline underline-offset-2">
              residência permanente
            </a>{' '}
            vem depois da temporária, com regra de presença — a gente explica. Quem investe capital
            pode ir direto à permanente pelo{' '}
            <a href="/investor-pass" className="text-[var(--accent)] underline underline-offset-2">
              Investor Pass
            </a>
            , com o mesmo time.
          </p>
        </Disclosure>
        <Disclosure title="Perguntas frequentes">
          <FAQ items={FAQ_ITEMS} />
        </Disclosure>
      </Section>

      {/* Depoimentos ficam de fora até existirem depoimentos reais (plano §7, §6.1). */}

      <ArticleCards
        site={SITE}
        title="Leia antes de decidir"
        articles={latest.map((post) => ({
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          href: contentHref(SITE, post.slugPath),
        }))}
        more={{ href: '/guias', label: 'Todos os guias' }}
      />

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
