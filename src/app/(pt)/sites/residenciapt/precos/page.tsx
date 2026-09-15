import type { Metadata } from 'next';
import { Breadcrumbs, Button, Container, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/precos';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Preços — Residência no Paraguai para Brasileiros',
    description:
      'Quanto custa cada rota de residência no Paraguai. Honorário fixo, cotado em reais ou dólares antes de você decidir — sem número inventado.',
    path: PATH,
  });
}

interface Row {
  service: string;
  href: string;
  note: string;
}

/**
 * Anton has not supplied real packages/prices yet (plan §7, same deferral S3
 * recorded). Every row renders as "a partir de" with a TODO note instead of
 * an invented number (plan §4.11).
 */
const ROWS: Row[] = [
  {
    service: 'Residência temporária',
    href: '/residencia/temporaria',
    note: 'Checklist de documentos, protocolo e consultas em Assunção.',
  },
  {
    service: 'Residência permanente',
    href: '/residencia/permanente',
    note: 'Depois da temporária, ou direto, se o seu caso já se qualifica.',
  },
  {
    service: 'Cédula de identidade',
    href: '/residencia/cedula',
    note: 'Protocolada para seguir a aprovação da sua residência sem intervalo.',
  },
  {
    service: 'Residência fiscal e RUC',
    href: '/residencia-fiscal',
    note: 'Registro de RUC e orientação sobre o sistema territorial.',
  },
  {
    service: 'Residência em família (por pessoa adicional)',
    href: '/familia',
    note: 'Cônjuge, filhos e dependentes junto com o titular do processo.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'Preços', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Um honorário fixo por rota, cotado antes de você decidir
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          Não publicamos um número único para todo mundo porque sua nacionalidade e a sua situação
          mudam o que precisa ser preparado — e preferimos cotar o seu honorário real a te dar uma
          cifra que acaba errada para o seu caso. Aqui vai cada rota que protocolamos, com o valor
          real confirmado em reais ou dólares na sua consulta.
        </p>

        <div className="mt-[var(--space-12)] overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Serviço</th>
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Honorário</th>
                <th className="py-[var(--space-3)] font-normal">O que cobre</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.service} className="border-b border-[var(--border)]">
                  <td className="py-[var(--space-4)] pr-[var(--space-4)]">
                    <a href={row.href} className="text-[var(--accent)] underline underline-offset-2">
                      {row.service}
                    </a>
                  </td>
                  <td className="py-[var(--space-4)] pr-[var(--space-4)] whitespace-nowrap">
                    a partir de <span title="TODO: valor real pendente — plano §7">R$ —</span>
                  </td>
                  <td className="py-[var(--space-4)] text-[var(--fg-muted)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          O Investor Pass tem sua própria estrutura de honorários, no seu próprio site — veja{' '}
          <a href="/investor-pass" className="text-[var(--accent)] underline underline-offset-2">
            o Investor Pass
          </a>
          .
        </p>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Descubra o seu honorário real</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Diga sua nacionalidade, sua rota e seu prazo. Cotamos o honorário fixo do seu caso
            antes de você se comprometer com qualquer coisa.
          </p>
          <div className="mt-[var(--space-8)] flex flex-wrap gap-[var(--space-3)]">
            <Button href="/contact">Falar com a gente</Button>
            <Button href="/route-finder" variant="secondary">
              Descobrir minha rota primeiro
            </Button>
          </div>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="residenciapt" variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
