import type { Metadata } from 'next';
import { Fact } from '@/components';
import { factText } from '@content/shared/facts';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/residencia/permanente';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Residência Permanente no Paraguai — Regras e Processo',
    description:
      'Como pedir a residência permanente no Paraguai vindo da temporária ou direto: regra de presença, documentos e o que muda para brasileiros.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Residência permanente"
      title="Residência permanente, o status que fica"
      intro="A permanente é o que a maioria das pessoas realmente quer: um cartão que não precisa de renovação constante e uma base estável para abrir empresa, comprar imóvel ou simplesmente parar de pensar em vencimento de documento."
      faq={[
        {
          question: 'Preciso passar pela temporária antes?',
          answer:
            'É o caminho mais comum, mas não o único — se você já se qualifica direto, avaliamos isso na consulta em vez de te fazer passar por uma etapa desnecessária.',
        },
        {
          question: 'O que é a regra de presença?',
          answer: `A permanente exige um mínimo de presença no país. Explicamos exatamente o que isso significa para o seu jeito de viajar: ${factText('permanent.presence_rule', 'pt')}.`,
        },
        {
          question: 'Isso me torna residente fiscal automaticamente?',
          answer:
            'Não. Residência migratória e residência fiscal são coisas diferentes — explicamos a diferença na página de residência fiscal, e o que muda na sua declaração no Brasil você confirma com seu contador.',
        },
      ]}
      serviceName="Protocolo de Residência Permanente no Paraguai"
      serviceDescription="Protocolo feito por nós da residência permanente no Paraguai, incluindo a passagem a partir da temporária."
      path={PATH}
    >
      <h2>Para quem serve essa rota</h2>
      <p>
        A residência permanente serve para quem já decidiu que o Paraguai faz parte do plano de
        vida — negócio, imóvel, aposentadoria ou simplesmente uma base mais estável do que a
        temporária permite. Também serve para quem, pela nacionalidade ou pelo caso, já se
        qualifica sem passar pela temporária primeiro.
      </p>
      <h2>A regra de presença</h2>
      <p>
        Ao contrário da temporária, a permanente vem com uma exigência de presença no país:{' '}
        <Fact k="permanent.presence_rule" site="residenciapt" />. Isso muda o planejamento para
        quem mora em cidades de fronteira como Foz do Iguaçu e cruza com frequência, e muda ainda
        mais para quem pensa em manter a vida principal no Brasil e usar o Paraguai como base
        secundária — conversamos sobre o seu padrão real de viagem antes de você decidir.
      </p>
      <h2>O que o processo envolve</h2>
      <p>
        Documentos legalizados, uma comprovação de meios atualizada e, quando você já tem
        temporária, o histórico dela como base do pedido. Montamos o checklist pela sua situação
        real, e não escondemos quando um caso é mais lento que a média — dizemos isso antes de
        você contratar, não depois.
      </p>
      <h2>Depois da permanente</h2>
      <p>
        Com a permanente aprovada, o próximo passo natural é o pedido da{' '}
        <a href="/residencia/cedula">cédula</a>, e muitos clientes olham também para a{' '}
        <a href="/residencia-fiscal">residência fiscal</a> se vão gerar renda no Paraguai. Se você
        ainda está decidindo entre temporária, permanente ou o Investor Pass, o{' '}
        <a href="/route-finder">teste de rota</a> ajuda em dois minutos.
      </p>
      <h2>O que está incluído</h2>
      <ul>
        <li>Avaliação honesta se você pode pular a temporária.</li>
        <li>Checklist de documentos pela sua nacionalidade e situação.</li>
        <li>
          Honorário fixo, cotado antes de você decidir — veja nossos <a href="/precos">preços</a>.
        </li>
      </ul>
    </ServicoPage>
  );
}
