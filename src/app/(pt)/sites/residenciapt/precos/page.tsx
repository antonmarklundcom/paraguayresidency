import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AfterYouMessage,
  Band,
  Breadcrumbs,
  Button,
  Eyebrow,
  Fact,
  Guarantee,
  Heading,
  LeadForm,
  PriceTable,
  SectionHeader,
  StickyCta,
  TrustBar,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { termLabel, textLink } from '@/lib/text-styles';

const SITE = 'residenciapt' as const;
const PATH = '/precos';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Preços — Residência no Paraguai para Brasileiros',
    description:
      'Quanto custa cada rota de residência no Paraguai. Honorário fixo, cotado em reais ou dólares antes de você decidir — sem número inventado.',
    path: PATH,
  });
}

const link = textLink;
const term = termLabel;

function Detail({ id, route, title, href, children }: {
  id: string; route: string; title: string; href: string; children: React.ReactNode;
}) {
  return (
    <section data-route-section={route} aria-labelledby={id} className="border-t border-[var(--border)] py-10">
      <Heading level={2} id={id} className="!text-(length:--step-2)">
        <Link href={href} className={link}>{title}</Link>
      </Heading>
      {children}
    </section>
  );
}

export default function Page() {
  return (
    <>
      <Band>
        <Breadcrumbs site={SITE} items={[{ label: 'Preços', href: PATH }]} />
        <div className="mt-10 max-w-3xl">
          <Eyebrow>Preços</Eyebrow>
          <Heading level={1} className="mt-4">Honorário fixo, com os custos separados explicados antes de decidir</Heading>
          <p className="mt-6 text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
            A cotação começa com uma mensagem —pelo WhatsApp ou pelo formulário— sobre sua nacionalidade,
            documentos, rota e planos de viagem. Combinamos o trabalho e o honorário fixo por escrito antes
            de você contratar. Não há calculadora automática: os documentos e as pessoas que vão solicitar
            definem o escopo.
          </p>
          <p className="mt-4 text-[var(--fg-muted)]">
            As taxas oficiais da Migração, as certidões e o câmbio em reais estão explicados, linha por linha, em{' '}
            <Link href="/guias/documentos/quanto-custa-a-residencia-no-paraguai" className={link}>quanto custa a residência no Paraguai</Link>.
          </p>
          <div data-service-cta className="mt-8 flex flex-wrap gap-3">
            <Button href="#inquiry">Escreva para nós</Button>
            <Button href="/route-finder" variant="secondary">Descubra sua rota</Button>
          </div>
        </div>
      </Band>

      <TrustBar site={SITE} />

      <PriceTable
        site={SITE}
        tone="alt"
        routes={['temporary', 'permanent', 'cedula']}
        title="As três rotas, lado a lado"
        intro="Nosso honorário e as taxas oficiais, separados, e o que cada rota inclui. Peça a cotação por escrito no botão de cada linha."
      />

      <Band labelledBy="detalhe-title">
        <SectionHeader id="detalhe-title" eyebrow="O detalhe" title="O que cada honorário cobre e como cotamos" />
        <div className="mt-10 max-w-3xl">
          <section data-fee-terms className="rounded-[var(--radius-brand)] bg-[var(--surface-alt)] p-6 md:p-8">
            <Heading level={2} className="!text-(length:--step-2)">O que cada honorário cobre</Heading>
            <p className="mt-4">A preparação, coordenação e orientação combinadas para sua rota, descritas abaixo.</p>
            <dl className="mt-4 space-y-4">
              <div><dt className="font-semibold">O que nunca está incluído</dt><dd>Taxas públicas, apostilas e traduções necessárias nunca estão incluídas no nosso honorário. Identificamos os custos de documentos aplicáveis ao pedido antes de você decidir.</dd></div>
              <div><dt className="font-semibold">O que você paga ao Estado e o que paga para nós</dt><dd>Você paga as taxas oficiais aplicáveis ao pedido diretamente ao Estado paraguaio. Paga para nós pela preparação e coordenação descritas aqui. Apostilas e traduções são pagas separadamente aos respectivos prestadores.</dd></div>
            </dl>
            <p className="mt-4">A orientação do seu próprio contador fica separada. Para o RUC, confirmamos por escrito se existe alguma taxa oficial de registro aplicável.</p>
          </section>

          <Detail id="temporary" route="temporary" title="Residência temporária" href="/residencia/temporaria">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Montamos o checklist pela sua nacionalidade, organizamos os documentos, agendamos as consultas em Assunção e protocolamos o pedido de residência temporária.</dd></div>
              <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na sua primeira mensagem revisamos sua nacionalidade e os documentos que já tem antes de cotar o protocolo. Também avaliamos a rota Mercosul para o seu caso.</dd></div>
            </dl>
          </Detail>

          <Detail id="permanent" route="permanent" title="Residência permanente" href="/residencia/permanente">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Avaliamos se você já se qualifica, montamos o checklist com base no seu histórico e protocolamos a residência permanente. Explicamos a regra de presença para seus planos de viagem.</dd></div>
              <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na sua primeira mensagem verificamos seu status atual e se você já se qualifica. Cotamos o pedido permanente separadamente de qualquer protocolo temporário anterior.</dd></div>
            </dl>
          </Detail>

          <Detail id="cedula" route="cedula" title="Cédula de identidade" href="/residencia/cedula">
            <dl className="mt-4 space-y-3">
              <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Agendamos a biometria após a aprovação da residência e acompanhamos o pedido até a emissão. Também avisamos sobre os prazos de renovação.</dd></div>
              <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na sua primeira mensagem verificamos a etapa da residência e se a coordenação da cédula já está no seu orçamento, para não cotar o mesmo trabalho novamente.</dd></div>
            </dl>
          </Detail>

          <Detail id="tax_residency" route="tax_residency" title="Residência fiscal e RUC" href="/residencia-fiscal">
            <p className="mt-4">
              <span className={term}>Honorário do serviço</span><br />
              <span className="font-medium first-letter:uppercase"><Fact k="pricing.tax_residency" site={SITE} /></span>
            </p>
            <dl className="mt-3 space-y-3">
              <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Explicamos a diferença entre residência migratória e fiscal e registramos o RUC quando sua atividade exige. Combinamos esse trabalho administrativo com seu processo de residência.</dd></div>
              <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na sua primeira mensagem, conte sua atividade no Paraguai e se precisa de RUC. As obrigações no Brasil ficam com seu próprio contador.</dd></div>
            </dl>
          </Detail>

          <Detail id="family" route="family" title="Residência em família" href="/familia">
            <p className="mt-4">
              <span className={term}>Honorário do serviço</span><br />
              <span className="font-medium first-letter:uppercase"><Fact k="pricing.family" site={SITE} /></span>
            </p>
            <dl className="mt-3 space-y-3">
              <div><dt className="font-semibold">O que o honorário fixo cobre</dt><dd>Montamos um checklist por pessoa e organizamos a ordem de protocolo do titular e dos dependentes. Consideramos os documentos de vínculo e as autorizações necessárias para cada familiar.</dd></div>
              <div><dt className="font-semibold">Como cotamos esta rota</dt><dd>Na sua primeira mensagem revisamos cada familiar e seus documentos. O honorário por pessoa adicional é cotado junto com o do titular, deixando claro quem está incluído.</dd></div>
            </dl>
          </Detail>

          <p className="border-t border-[var(--border)] pt-8">
            A <Link href="/mercosul" className={link}>rota Mercosul</Link> é avaliada dentro da cotação de residência, conforme sua nacionalidade e documentação.
          </p>
          <p className="mt-6">
            <Link href="/investor-pass" className={link}>O Investor Pass tem escopo e cotação próprios na nossa marca irmã. Veja a rota do Investor Pass.</Link>
          </p>
        </div>
      </Band>

      <AfterYouMessage site={SITE} tone="alt" />

      <Guarantee site={SITE} />

      <Band tone="alt" labelledBy="inquiry-title" id="inquiry">
        <div className="mx-auto max-w-3xl rounded-[var(--radius-brand)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--elev-1)] md:p-10">
          <Heading level={2} id="inquiry-title">Receba sua cotação por escrito</Heading>
          <p className="mt-4">Diga sua nacionalidade, rota e prazo. Confirmamos o escopo por escrito e depois detalhamos o honorário fixo e os custos separados, antes de você decidir.</p>
          <div className="mt-6"><Button href="/contact">Escreva para nós</Button></div>
          <div className="mt-8"><LeadForm site={SITE} variant="consultation" pagePath={PATH} /></div>
        </div>
      </Band>
      <StickyCta formId="inquiry" label="Escreva para nós" />
    </>
  );
}
