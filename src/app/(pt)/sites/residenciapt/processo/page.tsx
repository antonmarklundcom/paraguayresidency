import type { Metadata } from 'next';
import { Breadcrumbs, Container, Fact, Heading, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/processo';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'O Processo de Residência no Paraguai, Passo a Passo',
    description:
      'Da primeira conversa até a cédula na mão: o processo de residência no Paraguai passo a passo, com o checklist de documentos e o que acontece em cada etapa.',
    path: PATH,
  });
}

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: '1. A conversa inicial',
    body: 'Perguntamos sua nacionalidade, seu objetivo e seu prazo, dizemos qual rota serve — inclusive se é o Mercosul — e cotamos seu honorário fixo antes de qualquer protocolo.',
  },
  {
    title: '2. Seu checklist de documentos',
    body: 'Montado para a sua nacionalidade brasileira: quais órgãos de antecedentes são aceitos, qual cadeia de apostilamento se aplica, quais traduções a repartição paraguaia realmente reconhece. Dizemos qual item começar primeiro porque é o mais demorado.',
  },
  {
    title: '3. Legalização',
    body: 'Apostilamentos e traduções juramentadas, organizados para nada vencer antes da consulta certa. É aqui que a maioria dos atrasos acontece quando ninguém cuida da ordem — nós cuidamos.',
  },
  {
    title: '4. Protocolo e consultas',
    body: 'Agendamos as consultas em Assunção e protocolamos seu pedido. Quando a família está envolvida, agendamos todo mundo junto sempre que a repartição permite.',
  },
  {
    title: '5. Aprovação e a cédula',
    body: 'Depois da residência aprovada, vem o pedido da cédula. Ela é emitida dentro de uma janela que confirmamos, não que prometemos, e mantemos você informado em vez de deixar você checando um status sozinho.',
  },
  {
    title: '6. O que vem depois',
    body: 'A residência temporária corre pelo seu prazo, e depois a maioria pede a permanente. Alguns, depois de conhecer o país, olham para o Investor Pass. A gente continua com você de qualquer jeito.',
  },
];

const DOCUMENT_CHECKLIST = [
  'Certidão de nascimento, apostilada',
  'Antecedentes criminais do seu país de residência, apostilados',
  'Comprovação de meios (varia por rota — confirmamos o que serve para a sua)',
  'Traduções juramentadas de todo documento em outro idioma',
  'Passaporte válido durante todo o processo',
  'Certidão de casamento e documentos de dependentes, se o pedido for em família',
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'O processo', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          O que acontece de verdade, passo a passo
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Nenhuma etapa fica escondida até você já ter pagado por ela. Esse é o processo inteiro,
          na ordem em que ele realmente roda, para residência temporária, permanente e a cédula
          que vem depois.
        </p>

        <ol className="mt-[var(--space-12)] space-y-[var(--space-8)]">
          {STEPS.map((step) => (
            <li key={step.title} className="border-l-2 border-[var(--accent)] pl-[var(--space-6)]">
              <Heading level={3}>{step.title}</Heading>
              <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-[var(--space-16)]">
          <Heading level={2}>O checklist de documentos, resumido</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            A versão genérica, para você se situar. Seu checklist real é montado pela sua
            nacionalidade — veja{' '}
            <a
              href="/guias/documentos/apostilamento-e-traducao-de-documentos-brasileiros"
              className="text-[var(--accent)] underline underline-offset-2"
            >
              como apostilar seus documentos brasileiros
            </a>
            .
          </p>
          <ul className="mt-[var(--space-6)] list-disc space-y-[var(--space-2)] pl-6 text-[var(--fg-muted)]">
            {DOCUMENT_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="mt-[var(--space-12)] text-[var(--fg-muted)]">
          A residência temporária dura <Fact k="temporary.duration" site="residenciapt" />, e a
          cédula é <Fact k="cedula.timeline" site="residenciapt" />. Pronto para começar?{' '}
          <a href="/contact" className="text-[var(--accent)] underline underline-offset-2">
            Fale com a gente
          </a>{' '}
          ou faça o{' '}
          <a href="/route-finder" className="text-[var(--accent)] underline underline-offset-2">
            teste de rota
          </a>{' '}
          primeiro.
        </p>
      </Container>
    </Section>
  );
}
