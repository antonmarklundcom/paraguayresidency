import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, LeadForm, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/custo-de-vida';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Custo de Vida no Paraguai para Brasileiros',
    description:
      'Quanto custa morar no Paraguai vindo do Brasil: aluguel, mercado e o que realmente é mais barato — e o que não é. Sem número inventado.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'Custo de vida', href: PATH }]} />
        <header className="mt-[var(--space-8)]">
          <Heading level={1}>O custo de vida que o nome da marca promete</Heading>
          <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
            Vida no Paraguai não é só o documento — é o orçamento do mês, e é sobre isso que
            ninguém no Brasil explica direito. Aqui vai o que sabemos por experiência real de
            clientes, sem inventar um número que parece preciso e não é.
          </p>
        </header>
        <Prose className="mt-[var(--space-12)]">
          <h2>O panorama geral</h2>
          <p>
            <Fact k="costofliving.overview" site="residenciapt" />. A comparação muda dependendo
            de qual cidade brasileira você usa como referência — e é exatamente por isso que
            preferimos falar da sua situação específica a te dar uma média nacional inútil.
          </p>
          <h2>Aluguel</h2>
          <p>
            <Fact k="costofliving.rent" site="residenciapt" />. Assunção, Ciudad del Este e cidades
            menores têm faixas bem diferentes entre si — outro motivo para não existir um número
            único que sirva para todo mundo.
          </p>
          <h2>Mercado e restaurante</h2>
          <p>
            <Fact k="costofliving.groceries" site="residenciapt" />.
          </p>
          <h2>O que é pior do que no Brasil, sem enrolação</h2>
          <p>
            Não vendemos o Paraguai como paraíso. Fora de Assunção, a rede de saúde privada é mais
            limitada, e é preciso considerar isso no seu planejamento, especialmente se você tem
            uma condição que exige acompanhamento constante. A burocracia tem seu próprio ritmo — às
            vezes mais lento, às vezes mais simples do que a brasileira, dependendo do órgão. E a
            malha rodoviária fora dos eixos principais é mais simples do que a de uma capital
            brasileira grande. Falamos disso na consulta porque quem decide com informação
            completa tem menos chance de se arrepender depois.
          </p>
          <h2>Negócio, terra e a região de fronteira</h2>
          <p>
            Uma parte de quem vem do Brasil está pensando em negócio ou terra, não só em morar —
            principalmente quem já vive perto da fronteira. Veja nosso artigo sobre{' '}
            <a href="/guias/morar-no-paraguai/fronteira-ciudad-del-este-e-foz-do-iguacu">
              a vida na região de Ciudad del Este e Foz do Iguaçu
            </a>{' '}
            e a página de <a href="/residencia-fiscal">residência fiscal</a> se isso for parte do
            seu plano.
          </p>
        </Prose>
        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Vida no Paraguai começa pela residência</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            O custo de vida é só metade da conta — a outra metade é o documento que te deixa ficar.
            Conte seu caso e a gente diz qual rota de residência serve para o seu plano.
          </p>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="residenciapt" variant="contact" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
