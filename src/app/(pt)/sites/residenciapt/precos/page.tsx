import type { Metadata } from 'next';
import { Breadcrumbs, Button, StickyCta, Container, Fact, Heading, LeadForm, Section } from '@/components';
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

export default function Page() {
  return (
    <Section className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-[var(--space-16)]">
      <Container width="narrow">
        <Breadcrumbs site="residenciapt" items={[{ label: 'Preços', href: PATH }]} />
        <Heading level={1} className="mt-[var(--space-8)]">Honorário fixo, com os custos separados explicados antes de decidir</Heading>
        <p className="mt-[var(--space-4)] text-(length:--text-lg) text-[var(--fg-muted)]">A cotação começa numa consulta sobre sua nacionalidade, documentos, rota e planos de viagem. Combinamos o trabalho e o honorário fixo antes de você contratar. Não há calculadora automática: os documentos e as pessoas que vão solicitar definem o escopo.</p>
        <div data-service-cta className="my-[var(--space-6)] flex flex-wrap gap-[var(--space-3)]"><Button href="#inquiry">Fale com a gente</Button><Button href="/route-finder" variant="secondary">Descubra sua rota</Button></div>
        <section data-fee-terms className="mt-[var(--space-8)] rounded-[var(--radius-brand)] bg-[var(--surface-alt)] p-[var(--space-6)]"><Heading level={2}>O que cada honorário cobre</Heading><p className="mt-[var(--space-4)]">A preparação, coordenação e orientação combinadas para sua rota, descritas abaixo.</p><dl className="mt-[var(--space-4)] space-y-[var(--space-4)]"><div><dt className="font-semibold">O que nunca está incluído</dt><dd>Taxas públicas, apostilas e traduções necessárias nunca estão incluídas no nosso honorário. Identificamos os custos de documentos aplicáveis ao pedido antes de você decidir.</dd></div><div><dt className="font-semibold">O que você paga ao Estado e o que paga para nós</dt><dd>Você paga as taxas oficiais aplicáveis ao pedido diretamente ao Estado paraguaio. Paga para nós pela preparação e coordenação descritas aqui. Apostilas e traduções são pagas separadamente aos respectivos prestadores.</dd></div></dl><p className="mt-[var(--space-4)]">A orientação do seu próprio contador fica separada. Para o RUC, confirmamos na consulta se existe alguma taxa oficial de registro aplicável.</p></section>
        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="temporary">
          <Heading level={2} id="temporary"><a href="/residencia/temporaria" className="text-[var(--accent)] underline">Residência temporária</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorário do serviço: <Fact k="pricing.temporary" site="residenciapt" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Montamos o checklist pela sua nacionalidade, organizamos os documentos, agendamos as consultas em Assunção e protocolamos o pedido de residência temporária.</dd></div>
            <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na consulta revisamos sua nacionalidade e os documentos que já tem antes de cotar o protocolo. Também avaliamos a rota Mercosul para o seu caso.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="permanent">
          <Heading level={2} id="permanent"><a href="/residencia/permanente" className="text-[var(--accent)] underline">Residência permanente</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorário do serviço: <Fact k="pricing.permanent" site="residenciapt" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Avaliamos se você já se qualifica, montamos o checklist com base no seu histórico e protocolamos a residência permanente. Explicamos a regra de presença para seus planos de viagem.</dd></div>
            <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na consulta verificamos seu status atual e se você já se qualifica. Cotamos o pedido permanente separadamente de qualquer protocolo temporário anterior.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="cedula">
          <Heading level={2} id="cedula"><a href="/residencia/cedula" className="text-[var(--accent)] underline">Cédula de identidade</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorário do serviço: <Fact k="pricing.cedula" site="residenciapt" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Agendamos a biometria após a aprovação da residência e acompanhamos o pedido até a emissão. Também avisamos sobre os prazos de renovação.</dd></div>
            <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na consulta verificamos a etapa da residência e se a coordenação da cédula já está no seu orçamento, para não cotar o mesmo trabalho novamente.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="tax_residency">
          <Heading level={2} id="tax_residency"><a href="/residencia-fiscal" className="text-[var(--accent)] underline">Residência fiscal e RUC</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorário do serviço: <Fact k="pricing.tax_residency" site="residenciapt" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Explicamos a diferença entre residência migratória e fiscal e registramos o RUC quando sua atividade exige. Combinamos esse trabalho administrativo com seu processo de residência.</dd></div>
            <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na consulta conversamos sobre sua atividade no Paraguai e se precisa de RUC. As obrigações no Brasil ficam com seu próprio contador.</dd></div>
          </dl>
        </section>

        <section className="mt-[var(--space-6)] border-t border-[var(--border)] pt-[var(--space-6)]" aria-labelledby="family">
          <Heading level={2} id="family"><a href="/familia" className="text-[var(--accent)] underline">Residência em família</a></Heading>
          <p className="mt-[var(--space-4)] font-medium">Honorário do serviço: <Fact k="pricing.family" site="residenciapt" /></p>
          <dl className="mt-[var(--space-3)] space-y-[var(--space-3)]">
            <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Montamos um checklist por pessoa e organizamos a ordem de protocolo do titular e dos dependentes. Consideramos os documentos de vínculo e as autorizações necessárias para cada familiar.</dd></div>
            <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na consulta revisamos cada familiar e seus documentos. O honorário por pessoa adicional é cotado junto com o do titular, deixando claro quem está incluído.</dd></div>
          </dl>
        </section>
        <p className="mt-[var(--space-6)]">A <a href="/mercosul" className="underline">rota Mercosul</a> é avaliada dentro da cotação de residência, conforme sua nacionalidade e documentação.</p>
        <p className="mt-[var(--space-8)]"><a href="/investor-pass" className="text-[var(--accent)] underline">O Investor Pass tem escopo e cotação próprios na nossa marca irmã. Veja a rota do Investor Pass.</a></p>
        <div id="inquiry" className="scroll-mt-6 mt-[var(--space-16)] rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface-alt)] p-[var(--space-8)]">
          <Heading level={2}>Receba sua cotação por escrito</Heading>
          <p className="mt-[var(--space-4)]">Diga sua nacionalidade, rota e prazo. Na consulta confirmamos o escopo e depois detalhamos por escrito o honorário fixo e os custos separados, antes de você decidir.</p>
          <div className="mt-[var(--space-6)]"><Button href="/contact">Solicitar uma consulta</Button></div>
          <div className="mt-[var(--space-8)]"><LeadForm site="residenciapt" variant="consultation" pagePath={PATH} /></div>
        </div>
      <StickyCta formId="inquiry" label="Fale com a gente" />
      </Container>
    </Section>
  );
}
