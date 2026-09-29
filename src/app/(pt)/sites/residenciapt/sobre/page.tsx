import { t } from '@/i18n';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AfterYouMessage,
  Band,
  Breadcrumbs,
  Button,
  Eyebrow,
  Guarantee,
  Heading,
  OfficeStrip,
  TeamSection,
  TrustBar,
  Testimonials,
  CaseSnapshots,
} from '@/components';
import { siteMetadata } from '@/lib/metadata';

const SITE = 'residenciapt' as const;
const PATH = '/sobre';

export function generateMetadata(): Metadata {
  return siteMetadata(SITE, {
    title: 'Sobre a Vida no Paraguai — Quem Cuida do Seu Caso',
    description:
      'Um time em Assunção que protocola residência, cédula e residência fiscal toda semana para brasileiros. Quem somos e como trabalhamos.',
    path: PATH,
  });
}

const link = 'text-[var(--accent)] underline underline-offset-2';

export default function Page() {
  return (
    <>
      <Band>
        <Breadcrumbs site={SITE} items={[{ label: 'Sobre nós', href: PATH }]} />
        <div className="mt-10 max-w-3xl">
          <Eyebrow>Sobre nós</Eyebrow>
          <Heading level={1} className="mt-4">Um time em Assunção, fazendo isso toda semana</Heading>
          <p className="mt-6 text-(length:--step-1) leading-relaxed text-[var(--fg-muted)]">
            Vida no Paraguai nasceu de um recado direto: muito brasileiro pensa em morar no Paraguai,
            e quase ninguém explica direito a parte prática — a residência, o custo de vida real, a
            fronteira, o que muda na declaração no Brasil. Residência é o que abre a porta; cuidamos
            dela porque cuidamos dela toda semana, não porque é segredo de alguém.
          </p>
        </div>
      </Band>

      <TrustBar site={SITE} />

      <TeamSection site={SITE} tone="alt" />
      <Band tone="alt" className="!pt-0">
        <p className="max-w-[60ch] text-[var(--fg-muted)]">{t(SITE, 'about.teamBody')}</p>
      </Band>

      <Band labelledBy="principios-title">
        <h2 id="principios-title" className="sr-only">Como trabalhamos</h2>
        <div className="grid gap-x-12 gap-y-12 md:grid-cols-3">
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">Como trabalhamos</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              Um honorário fixo por rota, cotado em reais ou dólares antes de você decidir. Um
              checklist de documentos montado para a sua nacionalidade brasileira, não um PDF
              genérico. E quando a rota Mercosul ou uma rota diferente serve melhor para o seu
              caso, dizemos isso na sua primeira mensagem em vez de empurrar o caminho mais caro.
            </p>
          </div>
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">O que não fazemos</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              Não citamos números que não podemos sustentar — todo valor legal ou financeiro neste
              site está confirmado ou claramente marcado como estimativa que confirmamos por
              escrito para o seu caso. Não vendemos o Paraguai como imposto zero ou paraíso sem contrapartida, e
              não damos parecer sobre a sua declaração de imposto de renda no Brasil — isso é
              pergunta para o seu contador, e dizemos isso em vez de arriscar um palpite.
            </p>
          </div>
          <div className="border-t-2 border-[var(--accent)] pt-6">
            <Heading level={3} className="!text-(length:--step-2)">Quem mais faz parte do grupo</Heading>
            <p className="mt-4 leading-relaxed text-[var(--fg-muted)]">
              Vida no Paraguai cuida do atendimento em português para brasileiros. O{' '}
              <Link href="/investor-pass" className={link}>Investor Pass</Link>{' '}
              é a marca dedicada à residência permanente direta por investimento, em inglês, para
              quem já decidiu investir. O mesmo time cuida dos dois.
            </p>
          </div>
        </div>
      </Band>

      <Testimonials site={SITE} tone="alt" />
      <CaseSnapshots site={SITE} />
      <Guarantee site={SITE} tone="alt" />
      <OfficeStrip site={SITE} />
      <AfterYouMessage site={SITE} tone="alt" />

      <Band>
        <div className="flex flex-wrap gap-3">
          <Button href="/contact">Escreva para nós</Button>
          <Button href="/route-finder" variant="secondary">Descobrir minha rota</Button>
        </div>
      </Band>
    </>
  );
}
