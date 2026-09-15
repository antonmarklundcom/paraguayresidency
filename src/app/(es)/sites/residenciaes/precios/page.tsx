import type { Metadata } from 'next';
import { Breadcrumbs, Container, Heading, LeadForm, Section } from '@/components';
import { siteMetadata } from '@/lib/metadata';

const PATH = '/precios';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciaes', {
    title: 'Precios de la Residencia en Paraguay — Honorarios Fijos, Cotizados Antes',
    description:
      'Lo que cuestan nuestros trámites de residencia en Paraguay. Honorarios fijos, cotizados antes de que te comprometas — cifras reales confirmadas en tu llamada hasta que se publiquen aquí.',
    path: PATH,
  });
}

interface Row {
  service: string;
  href: string;
  note: string;
}

/**
 * Anton todavía no ha dado paquetes/precios reales (plan §7). Cada fila
 * muestra "desde" con una nota TODO en vez de una cifra inventada (plan
 * §4.11).
 */
const ROWS: Row[] = [
  {
    service: 'Residencia temporal',
    href: '/residencia/temporal',
    note: 'Lista de documentos, presentación y citas en Asunción.',
  },
  {
    service: 'Residencia permanente',
    href: '/residencia/permanente',
    note: 'Tras la temporal, o directa si ya calificas.',
  },
  {
    service: 'Cédula de identidad',
    href: '/residencia/cedula',
    note: 'Presentada para seguir a tu aprobación de residencia sin demora.',
  },
  {
    service: 'Residencia fiscal y RUC',
    href: '/residencia-fiscal',
    note: 'Alta de RUC y orientación sobre el sistema territorial.',
  },
  {
    service: 'Trámite familiar (por persona adicional)',
    href: '/familia',
    note: 'Cónyuge, hijos y dependientes que califiquen junto al solicitante principal.',
  },
];

export default function Page() {
  return (
    <Section>
      <Container width="narrow">
        <Breadcrumbs site="residenciaes" items={[{ label: 'Precios', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">
          Un honorario fijo por ruta, cotizado antes de que te comprometas
        </Heading>
        <p className="mt-[var(--space-4)] text-[var(--text-lg)] text-[var(--fg-muted)]">
          No publicamos una única cifra universal porque tu nacionalidad y tu situación cambian lo
          que hay que preparar — y preferimos cotizarte tu honorario real antes que una cifra que
          termine sin ajustarse a tu caso. Esto es cada ruta que tramitamos, con el honorario real
          confirmado en tu llamada.
        </p>

        <div className="mt-[var(--space-12)] overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[var(--text-sm)]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--fg-muted)]">
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Servicio</th>
                <th className="py-[var(--space-3)] pr-[var(--space-4)] font-normal">Honorario</th>
                <th className="py-[var(--space-3)] font-normal">Qué cubre</th>
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
                    desde <span title="TODO: cifra real pendiente — plan §7">EUR —</span>
                  </td>
                  <td className="py-[var(--space-4)] text-[var(--fg-muted)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[var(--space-6)] text-[var(--text-sm)] text-[var(--fg-muted)]">
          El Pase de Inversor tiene su propia estructura de honorarios en su propia marca — consulta{' '}
          <a href="/pase-inversor" className="text-[var(--accent)] underline underline-offset-2">
            el Pase de Inversor
          </a>
          .
        </p>

        <div className="mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Consigue tu honorario real</Heading>
          <p className="mt-[var(--space-2)] text-[var(--fg-muted)]">
            Dinos tu nacionalidad, tu ruta y tu plazo. Cotizamos el honorario fijo para tu caso
            antes de que te comprometas a nada.
          </p>
          <div className="mt-[var(--space-8)]">
            <LeadForm site="residenciaes" variant="consultation" pagePath={PATH} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
