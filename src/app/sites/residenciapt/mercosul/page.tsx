import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/mercosul';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Rota Mercosul para Residência no Paraguai — Brasileiros',
    description:
      'O que o acordo do Mercosul realmente simplifica para brasileiros que pedem residência no Paraguai, e o que continua igual. Sem promessa vazia.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Rota Mercosul"
      title="A rota Mercosul, sem exagero sobre o que ela resolve"
      intro="Brasileiro tem o Mercosul a favor — mas o acordo simplifica partes específicas do processo, não o processo inteiro. Aqui explicamos o que muda de verdade e o que continua exigindo os mesmos documentos de sempre."
      faq={[
        {
          question: 'O acordo do Mercosul me dá residência automática?',
          answer:
            'Não é automático. Ele simplifica partes do trâmite para nacionais dos países-membros, mas você ainda passa por um processo de pedido e aprovação.',
        },
        {
          question: 'Isso é mais rápido do que a rota comum?',
          answer:
            'Em algumas partes, sim. Dizemos exatamente onde na sua consulta, porque a implementação muda com o tempo e não queremos prometer um prazo que a regra atual não sustenta.',
        },
        {
          question: 'Vale a pena entrar pelo Mercosul mesmo se eu já me qualifico pela rota comum?',
          answer:
            'Às vezes sim, às vezes não — depende do seu caso. Comparamos as duas rotas com você antes de escolher, em vez de empurrar a que parece mais vendável.',
        },
      ]}
      serviceName="Rota Mercosul para Residência no Paraguai"
      serviceDescription="Avaliação e protocolo da rota de residência simplificada do Mercosul no Paraguai para nacionais brasileiros."
      path={PATH}
      formVariant="contact"
    >
      <h2>O que o acordo realmente diz</h2>
      <p>
        O Mercosul tem <Fact k="mercosur.residency_route" site="residenciapt" />. Isso não é a
        mesma coisa que uma residência automática ou sem análise — é um caminho com regras
        próprias, implementado nacionalmente, e que muda com o tempo. Tratamos essa rota com o
        mesmo cuidado que qualquer outra: dizemos o que ela cobre para o seu caso antes de você
        decidir por ela.
      </p>
      <h2>O que costuma simplificar</h2>
      <p>
        Na prática, nacionais de países do Mercosul costumam ter menos exigência de comprovação
        de alguns documentos e um caminho mais direto entre a residência temporária e a permanente.
        O que não muda: você ainda precisa legalizar seus documentos, ainda comparece às consultas
        presencialmente, e ainda depende da aprovação da repartição de migrações paraguaia.
      </p>
      <h2>Mercosul não é a mesma coisa que residência fiscal</h2>
      <p>
        Entrar pela rota Mercosul resolve a parte migratória. O que muda na sua declaração de
        imposto de renda no Brasil é uma questão separada — veja nossa página de{' '}
        <a href="/residencia-fiscal">residência fiscal</a>, e confirme sempre com seu contador
        antes de mudar qualquer coisa na sua declaração.
      </p>
      <h2>Como decidir</h2>
      <p>
        Se você tem nacionalidade brasileira e está pensando em residência temporária ou
        permanente, vale a pena comparar a rota Mercosul com a rota padrão antes de protocolar. O{' '}
        <a href="/route-finder">teste de rota</a> já leva isso em conta, ou fale direto com a gente
        pelo formulário abaixo.
      </p>
    </ServicoPage>
  );
}
