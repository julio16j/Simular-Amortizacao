import Link from "next/link";
import { disclaimer } from "../components/EducationalContent";
export const sources = {
  birthday:
    "https://www.fgts.gov.br/Paginas/trabalhador/saque/saque-aniversario.aspx",
  housing:
    "https://www.caixa.gov.br/voce/habitacao/Paginas/utilizacao-fgts.aspx",
  manual:
    "https://www.caixa.gov.br/Downloads/fgts-moradia/MANUAL_DA_MORADIA_PROPRIA_21_10_2024_V_034.pdf",
};
export const articles = {
  "reduzir-prazo-ou-prestacao": {
    title: "Amortizar: reduzir prazo ou prestação?",
    description:
      "Entenda como a amortização altera o prazo, o valor das parcelas e os juros futuros do financiamento imobiliário.",
    body: (
      <>
        <p>
          Ao amortizar, você devolve uma parte do principal antes do previsto. O
          saldo devedor cai, e os próximos juros passam a incidir sobre uma
          dívida menor. A forma de recalcular o contrato define o que acontece
          depois.
        </p>
        <h2>Quando o objetivo é reduzir prazo</h2>
        <p>
          A referência da prestação financeira é preservada no Price. Como há
          menos saldo a pagar, o financiamento pode acabar antes. No SAC,
          preserva-se a referência da amortização ordinária do principal,
          enquanto os juros acompanham o saldo.
        </p>
        <p>
          Com uma entrada extra igual e premissas equivalentes, essa escolha
          tende a diminuir mais os juros futuros, pois mantém o ritmo de
          devolução do principal. A comparação precisa considerar a capacidade
          de manter esses pagamentos ao longo do tempo.
        </p>
        <h2>Quando o objetivo é reduzir prestação</h2>
        <p>
          O saldo menor é redistribuído pelo prazo restante. A prestação futura
          fica menor e abre espaço no orçamento. O cálculo de juros e encargos
          continua mês a mês; não basta dividir o extra pelo número de parcelas.
        </p>
        <h2>Um exemplo sem juros</h2>
        <p>
          Imagine R$ 12.000 a pagar em 12 meses, sem juros nem encargos: são R$
          1.000 por mês. Depois da primeira parcela, um extra de R$ 3.000 deixa
          R$ 8.000 de saldo. Mantendo R$ 1.000 mensais, faltam oito parcelas.
          Mantendo os onze meses restantes, o principal mensal cai para
          aproximadamente R$ 727,27, com ajuste de centavos na última parcela.
        </p>
        <h2>Como comparar na ferramenta</h2>
        <p>
          Use o mesmo saldo, juros, TR e encargos para as duas opções. Altere
          apenas o objetivo da amortização. Compare a data de quitação e o custo
          total, lembrando que a prestação menor também significa um fluxo
          mensal diferente.
        </p>
        <p>
          Esta comparação é educacional e não considera sua reserva de
          emergência, outras dívidas ou alternativas de investimento. A decisão
          depende também do seu orçamento e das condições do contrato.
        </p>
      </>
    ),
  },
  "price-ou-sac": {
    title: "Tabela Price e SAC: como funcionam no financiamento",
    description:
      "Conheça a diferença entre Price e SAC, a composição das parcelas e o efeito das amortizações e da TR.",
    body: (
      <>
        <p>
          Os dois sistemas devolvem o principal e cobram juros sobre o saldo
          devedor. A diferença está no ritmo da amortização ordinária. Para
          comparar, mantenha o mesmo saldo, prazo e taxa.
        </p>
        <h2>Como funciona a Tabela Price</h2>
        <p>
          Sem correção ou reajustes, a prestação financeira é constante. Nos
          primeiros meses, uma parcela maior do pagamento corresponde a juros. À
          medida que o saldo diminui, a amortização do principal aumenta.
        </p>
        <div className="formula">PMT = PV × i / [1 − (1 + i)⁻ⁿ]</div>
        <p>
          PV é o saldo inicial da projeção, i é a taxa mensal e n é o prazo em
          meses. Se a taxa for zero, a prestação é o saldo dividido pelo prazo.
        </p>
        <h2>Como funciona o SAC</h2>
        <p>
          A amortização ordinária inicial é o saldo dividido pelo prazo. Os
          juros são calculados sobre o saldo de cada período. Sem correção, a
          prestação diminui conforme a dívida é devolvida.
        </p>
        <p>
          Por exemplo, R$ 12.000 em 12 meses têm amortização de R$ 1.000 por
          mês. Com juros de 1% ao mês e sem outros custos, a primeira prestação
          é R$ 1.120 e a última é R$ 1.010. Os juros somam R$ 780.
        </p>
        <h2>Seguro, taxas e TR são componentes separados</h2>
        <p>
          A prestação financeira não é necessariamente o valor do boleto. Seguro
          e tarifas são encargos adicionais. Quando há TR, o saldo pode ser
          corrigido, e o contrato determina como reajustar a prestação. Por
          isso, “Price fixa” não significa que todo boleto ficará igual durante
          décadas.
        </p>
        <h2>Taxa nominal não é taxa efetiva</h2>
        <p>
          Uma taxa nominal anual de 12%, com capitalização mensal nessa
          convenção, equivale a 1% ao mês. Uma taxa efetiva de 12% ao ano
          corresponde a aproximadamente 0,948879% ao mês. Use a convenção
          informada no contrato.
        </p>
      </>
    ),
  },
  "amortizar-com-fgts": {
    title: "Como simular a amortização imobiliária com FGTS",
    description:
      "Projete depósitos, rendimento, saque-aniversário e saldo livre do FGTS, com intervalos e restrições explícitos.",
    body: (
      <>
        <p>
          O simulador separa o uso direto do fundo e o dinheiro retirado pelo
          saque-aniversário. Cada movimentação diminui o saldo do FGTS, evitando
          que o mesmo recurso seja aplicado duas vezes.
        </p>
        <h2>Uso direto na dívida habitacional</h2>
        <p>
          Esta versão adota o intervalo usual mínimo de 24 meses por
          trabalhador. A aplicação depende da premissa de elegibilidade marcada
          no formulário, do saldo livre e do intervalo desde a última
          utilização. Um intervalo pretendido menor não libera automaticamente a
          operação.
        </p>
        <p>
          Trabalhador, imóvel e financiamento precisam atender aos requisitos
          aplicáveis. O simulador não consulta sua conta nem verifica
          documentos. Consulte o{" "}
          <a href={sources.housing}>uso do FGTS na habitação pela Caixa</a>{" "}
          antes de agir.
        </p>
        <h2>Saque-aniversário</h2>
        <p>
          O saque anual estimado usa a tabela de percentuais e parcelas
          adicionais publicada pelo FGTS. Você pode destiná-lo à dívida,
          guardá-lo fora do fundo ou desconsiderá-lo. Em caso de saldo
          bloqueado, só o valor livre é movimentado.
        </p>
        <p>
          Empréstimos de antecipação são operações diferentes do saque anual e
          não são simulados. Se houver antecipação, informe os bloqueios e
          confirme a disponibilidade real. Consulte a{" "}
          <a href={sources.birthday}>fonte oficial do saque-aniversário</a>.
        </p>
        <h2>O que acontece em cada mês</h2>
        <p>
          O fundo recebe rendimento e depósitos na ordem configurada. Depois das
          prestações e dos extras próprios, as operações do FGTS seguem a ordem
          escolhida no formulário. Se a dívida já estiver quitada, o uso direto
          para amortização não acontece. Um saque maior que a dívida tem o
          restante registrado como guardado.
        </p>
        <h2>Rendimento é uma premissa</h2>
        <p>
          Informe uma taxa anual total estimada. Ela já deve incluir todos os
          componentes que você deseja projetar; não se soma a TR novamente.
          Distribuição de resultados, mudanças de emprego e liberações
          extraordinárias não são previstas.
        </p>
        <p>
          Fontes revisadas em 02/11/2026. A projeção não equivale a autorização
          da Caixa.{" "}
          <Link href="/metodologia/">
            Veja os critérios e as limitações completos
          </Link>
          .
        </p>
      </>
    ),
  },
};
export const informationPages = {
  metodologia: {
    title: "Metodologia, premissas e fontes",
    description:
      "Confira fórmulas, arredondamento, ordem dos eventos, hipóteses de TR e limitações do simulador de amortização.",
    body: (
      <>
        <p>
          O motor é determinístico: os mesmos dados geram as mesmas linhas
          mensais. O cenário sem extras e a estratégia usam o mesmo sistema de
          juros, TR e encargos. A economia é a diferença entre os juros
          efetivamente projetados, e não a multiplicação da parcela pelo prazo
          economizado.
        </p>
        <h2>Precisão e conversão de taxas</h2>
        <p>
          Usamos Decimal.js com 36 dígitos de precisão. Entradas monetárias são
          convertidas em centavos. Juros, correção, rendimento e pagamentos são
          arredondados mensalmente ao centavo mais próximo, com metade para
          cima. A tabela registra a diferença do arredondamento de TR e juros em
          centavos.
        </p>
        <p>
          Taxa nominal anual é dividida por 12, assumindo capitalização mensal.
          Para taxa efetiva anual, TR e rendimento anual total do FGTS, usamos
          (1 + taxa)^(1/12) − 1. Taxas mensais são aplicadas diretamente. Juros
          e TR são calculados separadamente.
        </p>
        <h2>Ordem mensal das operações</h2>
        <ol>
          <li>Partir do saldo inicial e aplicar a TR daquele ano.</li>
          <li>
            Atualizar a referência de pagamento conforme a hipótese escolhida.
          </li>
          <li>
            Calcular juros sobre o saldo corrigido e amortização ordinária;
            adicionar seguro e tarifa à prestação total.
          </li>
          <li>
            Projetar o rendimento e depósito do FGTS na ordem configurada.
          </li>
          <li>
            Aplicar o extra próprio mensal, limitado ao principal disponível.
          </li>
          <li>
            Processar saque-aniversário e FGTS direto na ordem configurada,
            retirando recursos do fundo a cada uso.
          </li>
          <li>
            Recalcular prazo ou prestação após cada extra e registrar os saldos
            finais e os totais acumulados.
          </li>
        </ol>
        <p>
          Todas as datas pertencem à competência mensal: não calculamos juros
          diários ou a posição exata dentro do mês. Uma operação datada dentro
          do mês é tratada na competência da prestação, na ordem acima. O dia do
          vencimento é preservado quando possível, usando o último dia em meses
          mais curtos.
        </p>
        <h2>Price, SAC e reajuste pela TR</h2>
        <p>
          No Price, usamos a fórmula PMT = PV × i / [1 − (1 + i)⁻ⁿ]. No SAC, a
          amortização inicial é PV / n. Ao reduzir prestação, recalculamos para
          o prazo restante; ao reduzir prazo, preservamos a referência
          financeira no Price ou a amortização ordinária no SAC.
        </p>
        <p>
          Há três hipóteses editáveis de reajuste: corrigir a referência pela TR
          mensal, manter referência fixa ou recalcular mensalmente pelo saldo e
          prazo restante. São aproximações contratuais distintas. Nenhuma delas
          é apresentada como regra universal da Caixa.
        </p>
        <p>
          A referência informada exclui os encargos quando marcado que já estão
          no boleto. Para SAC com referência informada, deduzimos os juros
          iniciais para obter a amortização ordinária de referência. A taxa
          efetiva adicional do exemplo é apenas informativa.
        </p>
        <h2>Quitação e prestação insuficiente</h2>
        <p>
          A prestação final fica limitada ao saldo e juros devidos. Um resíduo
          de arredondamento de até um centavo por mês do prazo original pode ser
          ajustado no vencimento estimado; não há parcela-balão para forçar a
          quitação.
        </p>
        <p>
          Se a prestação não cobrir os juros, o valor não pago é incorporado ao
          saldo, identificado na memória. O limite de segurança é 1.200 meses ou
          crescimento excessivo da dívida. Cenários sem quitação exibem custos
          parciais e não recebem uma economia final calculada.
        </p>
        <h2>FGTS e fontes regulamentares</h2>
        <p>
          O saque-aniversário usa sete faixas de saldo e suas parcelas
          adicionais. O saldo é agregado em uma conta de projeção. A restrição
          de saldo bloqueado permanece fixa em reais, sem prever liberação de
          garantias. Saques bloqueados podem ser desabilitados integralmente. O
          saldo só diminui pelo que foi retirado ou utilizado.
        </p>
        <ul>
          <li>
            <a href={sources.birthday}>
              FGTS: tabela e condições do saque-aniversário
            </a>
            , consultado em 02/11/2026.
          </li>
          <li>
            <a href={sources.housing}>
              Caixa: utilização do FGTS na casa própria
            </a>
            , referência para requisitos habitacionais.
          </li>
          <li>
            <a href={sources.manual}>
              Manual da Moradia Própria, versão 034 de 21/10/2024
            </a>
            , referência do intervalo usual de dois anos. A versão aplicável e
            eventuais exceções devem ser confirmadas com o agente financeiro.
          </li>
        </ul>
        <p>
          A primeira utilização direta não pode anteceder a próxima prestação.
          Se o fundo começar antes do financiamento, projetamos a acumulação e
          descontamos saques anteriores; esses recursos já retirados ficam fora
          dos fluxos futuros da dívida. Informe preferencialmente o saldo
          atualizado na competência da próxima prestação.
        </p>
        <h2>O que compõe o custo</h2>
        <p>
          Somamos prestações (financeiro, seguro e tarifa), extras próprios e
          FGTS aplicado, incluindo saque-aniversário usado na dívida. Não
          somamos a TR novamente: ela já integra o saldo pago. Depósitos no
          fundo e saques guardados não são pagamentos da dívida. Entrada e
          parcelas anteriores ao início ficam fora do custo futuro.
        </p>
        <h2>Limitações da primeira versão</h2>
        <p>
          Não modelamos juros pro rata por dia, calendário de feriados, seguros
          por idade ou saldo, renegociação, inadimplência, tributos, valor
          presente, custo de oportunidade, antecipação de saque-aniversário ou
          desbloqueios futuros. Reajustes anuais dos encargos e depósitos são
          hipóteses fixas por aniversário da projeção. Os cenários de TR de
          0,5%, 1,5% e 2,5% ao ano são ilustrativos, editáveis e não representam
          previsão oficial.
        </p>
        <p>{disclaimer}</p>
      </>
    ),
  },
  sobre: {
    title: "Sobre o Simular Amortização",
    description:
      "Uma ferramenta independente para entender o custo do financiamento e planejar amortizações com transparência.",
    body: (
      <>
        <p>
          O Simular Amortização ajuda você a entender o efeito de pagamentos
          extras no financiamento imobiliário. A proposta é mostrar o caminho
          mês a mês, com premissas visíveis e resultados que podem ser
          conferidos.
        </p>
        <h2>Como funciona</h2>
        <p>
          Os cálculos acontecem no seu navegador. Não exigimos cadastro, CPF ou
          dados bancários. Você informa os parâmetros do contrato e compara a
          estratégia com um cenário sem amortizações extras.
        </p>
        <h2>Transparência</h2>
        <p>
          Somos uma ferramenta independente, sem vínculo com a Caixa ou outras
          instituições financeiras. As projeções são educativas. Elas não
          substituem uma proposta oficial, análise contratual ou avaliação
          individual do seu orçamento.
        </p>
        <p>
          Veja a <Link href="/metodologia/">metodologia e as fontes</Link> para
          conhecer os critérios e limitações. Os guias explicam as premissas
          usadas pelo simulador e indicam as fontes para conferência.
        </p>
        <h2>Responsável e contato</h2>
        <p>
          O responsável pelo site e autor dos guias é Julio Cesar Urbano. Para
          dúvidas, sugestões ou relatos de erros, entre em contato pelo{" "}
          <a href="mailto:jc.urbano.vasconcelos@gmail.com">
            jc.urbano.vasconcelos@gmail.com
          </a>{" "}
          ou pelo telefone <a href="tel:+5583996216059">(83) 99621-6059</a>.
        </p>
        <h2>Critérios do conteúdo</h2>
        <p>
          Os guias apresentam explicações educativas, exemplos e limitações dos
          cálculos. As fontes oficiais estão indicadas na metodologia e nos
          textos sobre FGTS. A data de atualização identifica a versão do
          conteúdo; não representa uma validação pelo banco ou revisão por
          consultor financeiro.
        </p>
      </>
    ),
  },
  privacidade: {
    title: "Privacidade dos dados da simulação",
    description:
      "Entenda quais dados são utilizados e como funciona a simulação inteiramente no navegador.",
    body: (
      <>
        <p>
          Nesta versão, os valores informados são processados localmente no
          navegador. O simulador não envia os dados financeiros a um servidor,
          não usa autenticação e não salva automaticamente simulações em banco
          de dados, cookies ou localStorage.
        </p>
        <h2>Arquivos exportados</h2>
        <p>
          Ao baixar um CSV, o navegador cria um arquivo com a evolução
          financeira. Ele fica sob seu controle. Evite compartilhar o arquivo se
          não quiser expor os valores do financiamento.
        </p>
        <h2>Serviços externos</h2>
        <p>
          O site integra o Google AdSense para publicidade. O Google e outros
          fornecedores de anúncios podem usar cookies e identificadores para
          exibir e medir anúncios com base em visitas a este e a outros sites.
          Esses serviços podem receber informações técnicas, como endereço IP,
          navegador e páginas visitadas. O simulador não envia os valores dos
          campos financeiros ao AdSense.
        </p>
        <p>
          Você pode gerenciar a personalização na página de{" "}
          <a href="https://myadcenter.google.com/">
            preferências de anúncios do Google
          </a>{" "}
          e consultar{" "}
          <a href="https://policies.google.com/technologies/partner-sites?hl=pt-BR">
            como o Google usa dados em sites parceiros
          </a>
          . Para opções de outros fornecedores, consulte{" "}
          <a href="https://optout.aboutads.info/">
            as preferências da Digital Advertising Alliance
          </a>
          .
        </p>
        <p>
          O site é hospedado no GitHub Pages. O provedor pode registrar dados
          técnicos de acesso, como IP e data da requisição, conforme a{" "}
          <a href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement">
            política de privacidade do GitHub
          </a>
          . Links externos levam a serviços com suas próprias práticas de
          privacidade.
        </p>
        <h2>Ao sair da página</h2>
        <p>
          Fechar ou recarregar a página restaura os parâmetros padrão. Os
          arquivos CSV baixados permanecem no dispositivo até você removê-los.
        </p>
        <p>Atualizado em 02/11/2026.</p>
      </>
    ),
  },
  termos: {
    title: "Termos de uso e aviso sobre estimativas",
    description:
      "Finalidade educativa, premissas e limites de uso das projeções financeiras do Simular Amortização.",
    body: (
      <>
        <p>{disclaimer}</p>
        <h2>Uso da ferramenta</h2>
        <p>
          Confira os dados e as hipóteses antes de interpretar qualquer
          resultado. O valor de quitação e a disponibilidade do FGTS devem ser
          confirmados com a instituição responsável.
        </p>
        <h2>Limites</h2>
        <p>
          A simulação não constitui aconselhamento financeiro individual, oferta
          de crédito ou autorização para movimentar o FGTS. Não há promessa de
          economia contratual, rentabilidade futura ou aprovação de qualquer
          operação.
        </p>
        <p>
          Conheça as{" "}
          <Link href="/metodologia/">
            fórmulas, fontes e eventos não modelados
          </Link>
          . A identificação do responsável e o canal de contato serão incluídos
          antes da publicação desta versão local.
        </p>
      </>
    ),
  },
};
