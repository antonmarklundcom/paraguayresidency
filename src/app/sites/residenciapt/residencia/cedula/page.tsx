import type { Metadata } from 'next';
import { Fact } from '@/components';
import { siteMetadata } from '@/lib/metadata';
import { ServicoPage } from '@/app/sites/residenciapt/_lib/ServicoPage';

const PATH = '/residencia/cedula';

export function generateMetadata(): Metadata {
  return siteMetadata('residenciapt', {
    title: 'Cédula Paraguaia — Como Pedir Depois da Residência',
    description:
      'A cédula paraguaia é o documento do dia a dia depois da residência aprovada. Veja o prazo, o que exige e como a gente cuida do pedido por você.',
    path: PATH,
  });
}

export default function Page() {
  return (
    <ServicoPage
      crumbLabel="Cédula"
      title="A cédula: seu documento do dia a dia no Paraguai"
      intro="A residência abre a porta; a cédula é o que você usa todos os dias — para abrir conta, alugar imóvel, assinar contrato e provar quem você é sem carregar o passaporte. É a etapa que fecha o processo."
      faq={[
        {
          question: 'Quanto tempo depois da residência sai a cédula?',
          answer:
            'É emitida depois que a sua residência é aprovada — damos uma janela realista para o seu caso, não a estimativa mais otimista possível.',
        },
        {
          question: 'A cédula substitui o passaporte brasileiro?',
          answer:
            'Não, ela é um documento paraguaio de identidade, não uma segunda cidadania. Você continua brasileiro e continua usando seu passaporte para viajar.',
        },
        {
          question: 'Preciso ir pessoalmente para tirar a cédula?',
          answer:
            'Sim, a captura biométrica exige presença. Encaixamos isso no mesmo período das outras consultas para você não precisar de uma segunda viagem.',
        },
      ]}
      serviceName="Pedido de Cédula Paraguaia"
      serviceDescription="Protocolo do pedido de cédula de identidade paraguaia, feito para seguir sua residência aprovada sem intervalo."
      path={PATH}
    >
      <h2>O que a cédula realmente resolve</h2>
      <p>
        Sem a cédula, você é um residente aprovado mas ainda depende do passaporte e de papéis
        avulsos para provar isso no dia a dia. Com ela, abrir uma conta bancária, assinar um
        contrato de aluguel ou registrar uma empresa fica direto — é o documento que os balcões
        paraguaios reconhecem de cara.
      </p>
      <h2>O prazo</h2>
      <p>
        A cédula é <Fact k="cedula.timeline" site="residenciapt" />. Cuidamos do agendamento
        assim que sua residência sai, para não haver um vão entre um documento e o outro.
      </p>
      <h2>O que fazemos por você</h2>
      <ul>
        <li>Agendamos a captura biométrica junto com o restante do seu protocolo.</li>
        <li>Acompanhamos o pedido até a emissão, sem você precisar voltar à repartição sozinho.</li>
        <li>
          Avisamos sobre renovação e prazos, para a cédula nunca vencer sem você saber.
        </li>
      </ul>
      <p>
        Se você ainda não iniciou a residência, comece pela{' '}
        <a href="/residencia/temporaria">residência temporária</a> ou pela{' '}
        <a href="/residencia/permanente">permanente</a>, dependendo do seu caso.
      </p>
    </ServicoPage>
  );
}
