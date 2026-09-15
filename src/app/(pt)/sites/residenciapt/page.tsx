import type { Metadata } from 'next';
import {
  Bento,
  Button,
  Card,
  Container,
  Fact,
  FAQ,
  Heading,
  Section,
  SplitHero,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { whatsappHref } from '@/lib/whatsapp';
import { t } from '@/i18n';

const SITE = 'residenciapt' as const;

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: t(SITE, 'home.metaTitle'),
    description: t(SITE, 'home.metaDescription'),
    path: '/',
  });
}

const ROUTES = [
  {
    eyebrow: 'Residência temporária',
    title: 'O primeiro passo padrão',
    body: 'Prazo fixo, depois a permanente.',
    href: '/residencia/temporaria',
  },
  {
    eyebrow: 'Residência permanente',
    title: 'O cartão que fica',
    body: 'Regra de presença — a gente explica.',
    href: '/residencia/permanente',
  },
  {
    eyebrow: 'Rota Mercosul',
    title: 'Vantagem para brasileiros',
    body: 'O que simplifica de verdade, sem exagero.',
    href: '/mercosul',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Como sei qual rota serve para o meu caso?',
    answer:
      'Faça o teste de rota — seis perguntas, dois minutos — ou fale com a gente e dizemos direto, inclusive quando a rota padrão não serve para o seu caso.',
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

export default function Page() {
  const whatsapp = whatsappHref('Olá — tenho uma dúvida sobre residência no Paraguai.');

  const actions = (
    <>
      <Button href="/route-finder">{t(SITE, 'home.ctaPrimary')}</Button>
      <Button href="/contact" variant="secondary">
        {t(SITE, 'home.ctaSecondary')}
      </Button>
    </>
  );

  return (
    <>
      <SplitHero
        eyebrow="Vida no Paraguai"
        title={t(SITE, 'home.h1')}
        sub={t(SITE, 'home.sub')}
        actions={actions}
        aside={
          <ul className="space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>Honorário fixo por rota, cotado em reais ou dólares antes de você decidir.</li>
            <li>Checklist de documentos pela sua nacionalidade, não um PDF genérico.</li>
            <li>
              Dizemos quando a rota padrão não serve para você e mostramos o Mercosul ou o
              Investor Pass em vez disso.
            </li>
          </ul>
        }
      />

      <Section>
        <Container width="narrow">
          <Heading level={2}>Para quem é</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
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
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <Heading level={2}>Três rotas, um time</Heading>
          <div className="mt-[var(--space-8)]">
            <Bento>
              {ROUTES.map((route) => (
                <Card key={route.href} eyebrow={route.eyebrow} title={route.title} href={route.href}>
                  {route.body}
                </Card>
              ))}
            </Bento>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <Heading level={2}>Como funciona</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Uma conversa para confirmar sua rota e seu honorário, um checklist de documentos pela
            sua nacionalidade, legalização na ordem certa, protocolo e consultas em Assunção, e
            depois a cédula assim que a residência é aprovada. Veja{' '}
            <a href="/processo" className="text-[var(--accent)] underline underline-offset-2">
              o processo completo, passo a passo
            </a>
            .
          </p>
        </Container>
      </Section>

      <Section tone="accent">
        <Container width="narrow">
          <Heading level={2}>Por que o Paraguai</Heading>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-[var(--fg-muted)]">
            <li>
              A residência temporária dura <Fact k="temporary.duration" site={SITE} />, uma das
              rotas padrão mais acessíveis que existem.
            </li>
            <li>
              A residência permanente traz <Fact k="permanent.presence_rule" site={SITE} /> — a
              gente explica exatamente o que isso significa para o seu jeito de viajar.
            </li>
            <li>
              O sistema territorial de impostos faz com que{' '}
              <Fact k="tax.foreign_income_treatment" site={SITE} />, mas o que muda na sua
              declaração no Brasil é pergunta para o seu contador.
            </li>
            <li>
              Sobre custo de vida: <Fact k="costofliving.overview" site={SITE} />. Veja o detalhe
              em <a href="/custo-de-vida">custo de vida</a>.
            </li>
          </ul>
        </Container>
      </Section>

      {/* Depoimentos ficam de fora até existirem depoimentos reais (plano §7, §6.1). */}

      <Section>
        <Container width="narrow">
          <FAQ title="Perguntas frequentes" items={FAQ_ITEMS} />
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow" className="text-center">
          <Heading level={2}>Pronto para descobrir sua rota?</Heading>
          <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">
            Dois minutos dizem qual rota serve. Ou vá direto para uma conversa.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap justify-center gap-[var(--space-3)]">
            {actions}
          </div>
          {whatsapp && (
            <p className="mt-[var(--space-6)] text-[var(--text-sm)]">
              <a href={whatsapp} rel="noopener" className="text-[var(--accent)] underline underline-offset-2">
                Ou mande uma mensagem no WhatsApp
              </a>
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
