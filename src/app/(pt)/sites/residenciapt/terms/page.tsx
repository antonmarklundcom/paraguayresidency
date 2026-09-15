import type { Metadata } from 'next';
import { Container, Heading, Prose, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { getSite } from '@/sites/registry';

export function generateMetadata(): Metadata {
  const config = getSite('residenciapt');
  return siteMetadata('residenciapt', {
    title: `Termos de Serviço — ${config.name}`,
    description: `Os termos que valem quando você contrata o ${config.name} para residência, cédula ou residência fiscal.`,
    path: '/terms',
  });
}

export default function Page() {
  const config = getSite('residenciapt');
  return (
    <Section>
      <Container width="narrow">
        <Heading level={1}>Termos de Serviço</Heading>
        <p className="mt-[var(--space-4)] text-[var(--fg-muted)]">Atualizado em 09/09/2026.</p>
        <Prose className="mt-[var(--space-8)]">
          <h2>O que fornecemos</h2>
          <p>
            O {config.name} prepara e protocola pedidos de residência, cédula e residência fiscal
            no Paraguai em seu nome. Cotamos um honorário fixo para o seu caso específico antes de
            qualquer trabalho começar, com base nas informações que você fornece.
          </p>
          <h2>O que não podemos garantir</h2>
          <p>
            Preparamos e protocolamos seu caso de forma correta e completa. A decisão de aprovar
            qualquer pedido é exclusiva da autoridade de migrações do Paraguai, e nenhum prestador
            de serviço pode garantir o resultado ou o prazo de uma decisão do governo. Avisamos
            com honestidade quando algo no seu caso é fora do comum, em vez de prometer um
            resultado que não controlamos.
          </p>
          <h2>Honorários</h2>
          <p>
            O honorário cotado cobre nosso trabalho de preparação e protocolo conforme descrito no
            seu contrato. Taxas do governo, custos de correio, apostilamento e tradução cobrados
            por terceiros são separados e informados antes de serem gerados.
          </p>
          <h2>Consultoria jurídica e tributária</h2>
          <p>
            Somos um serviço de protocolo de residência, não um escritório de advocacia ou uma
            firma contábil. Quando uma pergunta realmente exige consultoria jurídica ou tributária
            específica para a sua situação — inclusive sobre a sua declaração de imposto de renda
            no Brasil — dizemos isso e indicamos um profissional qualificado, em vez de responder
            nós mesmos.
          </p>
          <h2>Alterações</h2>
          <p>
            Podemos atualizar estes termos conforme nossos serviços mudam. A versão em vigor é a
            publicada aqui no momento em que você nos contrata.
          </p>
        </Prose>
      </Container>
    </Section>
  );
}
