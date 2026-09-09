import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/residencia/temporaria';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Residência Temporária no Paraguai — Requisitos e Processo',
    description:
      'Como funciona a residência temporária no Paraguai: quem pode pedir, os documentos, as consultas e o que muda para brasileiros. Nós protocolamos por você.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Residência temporária"
      title="Residência temporária, o primeiro passo padrão"
      intro="Quase todo mundo começa por aqui. É a rota que a repartição de migrações espera, e é o jeito mais rápido de ter um pé no país — um cartão, o pedido da cédula, e um motivo legal para estar aqui enquanto você decide o quanto quer avançar."
      faq={[
        {
          question: 'Quanto tempo dura a residência temporária?',
          answer:
            'Ela roda por um prazo inicial fixo, e depois você pede a permanente. Confirmamos o prazo atual e o que acontece se ele vencer antes na sua consulta.',
        },
        {
          question: 'Preciso morar no Paraguai o ano todo para não perder o status?',
          answer:
            'Não. A residência temporária não tem a mesma exigência de presença mínima da permanente. A gente explica a diferença prática para o seu jeito de viajar antes de você protocolar.',
        },
        {
          question: 'E se meus documentos venceram até a data do protocolo?',
          answer:
            'Esse é o atraso mais comum. A gente organiza a ordem dos seus documentos para nenhum vencer antes da consulta certa — veja nosso guia sobre o que levar antes de pedir.',
        },
      ]}
      serviceName="Protocolo de Residência Temporária no Paraguai"
      serviceDescription="Protocolo feito por nós da residência temporária no Paraguai: lista de documentos, agendamento e envio do pedido."
      path={PATH}
    >
      <h2>Para quem serve essa rota</h2>
      <p>
        A residência temporária serve para quase todo brasileiro que quer um pé legal no Paraguai
        sem se comprometer, de cara, com as exigências mais fundas de presença e processo da
        residência permanente. Quem trabalha remoto, quem está testando o país antes de se mudar de
        vez, e quem quer construir o caminho até a permanente usam essa porta de entrada.
      </p>
      <h2>A rota Mercosul muda alguma coisa?</h2>
      <p>
        Se você tem nacionalidade de um país do Mercosul, parte do caminho muda:{' '}
        <Fact k="mercosur.residency_route" site="residenciapt" />. Explicamos exatamente o que
        simplifica no seu caso na consulta — veja também nossa página sobre a{' '}
        <a href="/mercosul">rota Mercosul</a>.
      </p>
      <h2>O que o processo envolve de verdade</h2>
      <p>
        Você traz um conjunto de documentos legalizados — certidão de nascimento, antecedentes
        criminais e comprovação de meios, cada um apostilado e traduzido do jeito que a repartição
        paraguaia aceita. Montamos essa lista pela sua nacionalidade brasileira, não um PDF
        genérico, porque o que importa (quais órgãos emitem o antecedente, como legalizar cada
        papel) muda de país para país. Depois disso é protocolo, um conjunto de consultas em
        Assunção, e a espera pela aprovação — em seguida vem o pedido da cédula.
      </p>
      <h2>Prazo e o que vem depois</h2>
      <p>
        A residência temporária dura <Fact k="temporary.duration" site="residenciapt" />. A maioria
        dos nossos clientes usa essa janela para decidir entre pedir a{' '}
        <a href="/residencia/permanente">residência permanente</a> ou, depois de conhecer o país,
        olhar para o{' '}
        <a href="/investor-pass">Investor Pass</a> se um investimento fizer mais sentido. Se você
        não tem certeza de qual rota serve, o <a href="/route-finder">teste de rota</a> leva dois
        minutos e responde.
      </p>
      <h2>O que está incluído</h2>
      <ul>
        <li>Lista de documentos montada para a sua nacionalidade, não uma lista genérica.</li>
        <li>Agendamento das consultas, organizado para uma viagem só resolver o protocolo.</li>
        <li>
          Honorário fixo, cotado antes de você decidir — veja nossos <a href="/precos">preços</a>.
        </li>
      </ul>
    </ServicoPage>
  );
}
