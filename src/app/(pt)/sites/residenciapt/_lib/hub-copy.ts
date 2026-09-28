/**
 * Per-hub copy for the `/guias/<hub>` index pages (seo-gap.md §0b.2): a unique
 * meta title and description, a visible H1 and a 60–120-word intro, so each
 * hub can rank for its own head query ("impostos no paraguai", "morar no
 * paraguai", …) instead of sharing one template sentence.
 *
 * residenciapt-only and brand-owned: the i18n brand files must carry the same
 * key set across all seven brands, so hub copy lives here, next to the pages
 * that use it. A hub without an entry falls back to the old template, so a new
 * hub folder never breaks the build. Meta text stays figure-free (no digits),
 * which the hub metadata test enforces.
 */
export interface HubCopy {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
}

export const HUB_COPY: Record<string, HubCopy> = {
  documentos: {
    metaTitle: 'Residência no Paraguai: documentos e passo a passo',
    metaDescription:
      'Como tirar a residência no Paraguai sendo brasileiro: passo a passo, custos, cédula, apostila, antecedentes e a rota Mercosul, sem enrolação.',
    h1: 'Residência e documentos no Paraguai',
    intro:
      'Tudo o que vem antes e depois do protocolo na Migração: qual rota serve para brasileiro, a ordem certa dos documentos, apostila e tradução, antecedentes, quanto custa de verdade, a cédula e o caminho até a cidadania. Os guias abaixo são escritos para quem sai do Brasil, com os valores oficiais citados da fonte e a data em que conferimos. Onde a resposta depende do seu caso, a gente diz isso em vez de chutar. Se você ainda não sabe por onde começar, comece pelo passo a passo e depois veja os custos.',
  },
  impostos: {
    metaTitle: 'Impostos no Paraguai para brasileiros: como funciona',
    metaDescription:
      'Impostos no Paraguai explicados para brasileiros: sistema territorial, IRP, IRE, IVA, residência fiscal e o que muda na sua declaração no Brasil.',
    h1: 'Impostos no Paraguai, do lado paraguaio e do brasileiro',
    intro:
      'O Paraguai tributa pela origem da renda, e isso é diferente de não pagar nada. Aqui separamos o que o sistema paraguaio realmente cobra (IRP, IRE, IVA e dividendos) do que continua sendo pergunta para o seu contador no Brasil: saída definitiva, renda que segue vindo de lá, INSS e dupla tributação. Os números paraguaios vêm da lei e da DNIT, com a fonte ao pé de cada guia. O que depende da Receita Federal fica marcado como tal, porque é assim que funciona.',
  },
  comparativos: {
    metaTitle: 'Paraguai, Brasil ou vizinhos: comparativos honestos',
    metaDescription:
      'Paraguai comparado com Brasil, Portugal, Uruguai e Argentina: residência, custo de vida, impostos e burocracia, incluindo onde o Paraguai perde.',
    h1: 'Paraguai comparado, sem torcida',
    intro:
      'Morar no Paraguai só faz sentido se ele ganhar da alternativa que você tem de verdade. Estes comparativos colocam o Paraguai lado a lado com o Brasil, Portugal, Uruguai e Argentina nos pontos que decidem uma mudança: como é o processo de residência, quanto custa viver, como cada país tributa, saúde, segurança e burocracia. Dizemos onde o Paraguai perde, porque perde em algumas coisas, e deixamos claro quando a resposta depende da sua renda, da sua família ou do seu contador.',
  },
  'morar-no-paraguai': {
    metaTitle: 'Morar no Paraguai: guias de vida para brasileiros',
    metaDescription:
      'Custo de vida, segurança, saúde, escola e a fronteira com Foz: como é o dia a dia de quem mora no Paraguai, contado sem pintar o país como paraíso.',
    h1: 'Morar no Paraguai, na vida real',
    intro:
      'A residência é o documento. Estes guias são sobre o resto: quanto custa viver, onde a segurança é boa e onde não é, como funcionam saúde e escola, e o que muda para quem mora na fronteira com Foz. Falamos com o brasileiro que está pensando em se mudar, não com quem quer ouvir que o Paraguai é perfeito. Onde o país é pior que o Brasil, como saúde fora de Assunção, estradas e burocracia, a gente diz, para o resto ser levado a sério.',
  },
  negocios: {
    metaTitle: 'Negócios no Paraguai: empresa, RUC e impostos',
    metaDescription:
      'Abrir empresa no Paraguai sendo brasileiro: EAS, RUC, regimes para pequenos negócios e serviços para o Brasil, com o que depende do seu contador.',
    h1: 'Negócios no Paraguai para brasileiros',
    intro:
      'Abrir empresa no Paraguai é mais simples do que muita gente imagina, e muito menos mágico do que as páginas de venda prometem. Estes guias explicam os tipos de empresa que brasileiros mais usam, como funcionam o RUC e os regimes para quem fatura pouco, e o que acontece quando a empresa paraguaia presta serviço para cliente no Brasil. O lado paraguaio vem com fonte e data. O lado brasileiro, que depende de onde você mora e declara, vem com um aviso claro: confirme com seu contador.',
  },
  cidades: {
    metaTitle: 'Cidades para morar no Paraguai: guias por cidade',
    metaDescription:
      'Onde morar no Paraguai sendo brasileiro: Assunção, Encarnación, Ciudad del Este e outras cidades comparadas por custo, bairros, saúde e escola.',
    h1: 'Onde morar no Paraguai',
    intro:
      'Morar em Assunção, em Encarnación ou na fronteira são vidas bem diferentes. Estes guias olham cada cidade pelo que pesa para uma família brasileira: aluguel e custo do dia a dia, bairros, hospitais e clínicas, escolas, distância do Brasil e o que falta em cada lugar. Não existe cidade certa para todo mundo, e a gente não finge que existe. Leia os guias, compare com a sua rotina e, quando tiver uma cidade em mente, a residência é o passo que vem antes da mudança.',
  },
};
