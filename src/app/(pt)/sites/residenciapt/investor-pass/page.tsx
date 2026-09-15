import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { siteOrigin } from '@/sites/registry';

const PATH = '/investor-pass';

/**
 * A short bridge page (plan §6.7): the Investor Pass brand is canonical for
 * this content and sells in English, so this page stays deliberately thin
 * and noindex rather than competing with paraguayinvestorpass.com in search.
 */
export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Investor Pass — Residência Permanente por Investimento',
    description:
      'Pule a residência temporária com um investimento qualificado. O Investor Pass é nossa marca dedicada para residência permanente direta — mesmo time.',
    path: PATH,
    noindex: true,
  });
}

export default function Page() {
  const investorpassOrigin = siteOrigin('investorpass');
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'Investor Pass', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Residência permanente em uma etapa só
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          O Investor Pass deixa um investimento qualificado pular a residência temporária e ir
          direto para o cartão permanente —{' '}
          <Fact k="investorpass.min_investment_usd" site="residenciapt" />, em quatro rotas
          diferentes, protocolado pelo mesmo time que cuida de tudo neste site.
        </p>
        <p className="mt-[var(--space-6)] text-[var(--fg-muted)]">
          Como esse programa fala com um perfil diferente — investidores, family offices, agentes
          de imigração — ele vive em uma marca própria, com seu próprio detalhamento. O site do
          Investor Pass é em inglês; se preferir, atendemos você em português por aqui e traduzimos
          o que for preciso.
        </p>
        <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
          <Button href={investorpassOrigin} external variant="primary">
            Visitar o site do Investor Pass (em inglês)
          </Button>
          <Button href="/residencia/permanente" variant="secondary">
            Ver a residência permanente padrão
          </Button>
        </div>
        <p className="mt-[var(--space-8)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          Não tem certeza de qual rota serve para o seu capital e prazo?{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            Faça o teste de rota
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
