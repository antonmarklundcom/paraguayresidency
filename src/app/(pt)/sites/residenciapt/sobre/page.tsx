import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/sobre';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Sobre a Vida no Paraguai — Quem Cuida do Seu Caso',
    description:
      'Um time em Assunção que protocola residência, cédula e residência fiscal toda semana para brasileiros. Quem somos e como trabalhamos.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'Sobre nós', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Um time em Assunção, fazendo isso toda semana
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Vida no Paraguai nasceu de um recado direto: muito brasileiro pensa em morar no Paraguai,
          e quase ninguém explica direito a parte prática — a residência, o custo de vida real, a
          fronteira, o que muda na declaração no Brasil. Residência é o que abre a porta; cuidamos
          dela porque cuidamos dela toda semana, não porque é segredo de alguém.
        </p>

        <div className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          <div>
            <Heading level={2}>Como trabalhamos</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Um honorário fixo por rota, cotado em reais ou dólares antes de você decidir. Um
              checklist de documentos montado para a sua nacionalidade brasileira, não um PDF
              genérico. E quando a rota Mercosul ou uma rota diferente serve melhor para o seu
              caso, dizemos isso na primeira conversa em vez de empurrar o caminho mais caro.
            </p>
          </div>
          <div>
            <Heading level={2}>O que não fazemos</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Não citamos números que não podemos sustentar — todo valor legal ou financeiro neste
              site está confirmado ou claramente marcado como estimativa que confirmamos na sua
              consulta. Não vendemos o Paraguai como imposto zero ou paraíso sem contrapartida, e
              não damos parecer sobre a sua declaração de imposto de renda no Brasil — isso é
              pergunta para o seu contador, e dizemos isso em vez de arriscar um palpite.
            </p>
          </div>
          <div>
            <Heading level={2}>Quem mais faz parte do grupo</Heading>
            <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
              Vida no Paraguai cuida do atendimento em português para brasileiros. O{' '}
              <a href="/investor-pass" className="text-[var(--accent)] underline underline-offset-2">
                Investor Pass
              </a>{' '}
              é a marca dedicada à residência permanente direta por investimento, em inglês, para
              quem já decidiu investir. O mesmo time cuida dos dois.
            </p>
          </div>
        </div>

        <div className="mt-[var(--space-16)] flex flex-wrap gap-[var(--space-3)]">
          <Button href="/contact">Fale com a gente</Button>
          <Button href="/route-finder" variant="secondary">
            Descobrir minha rota
          </Button>
        </div>
      </Container>
    </Section>
  );
}
