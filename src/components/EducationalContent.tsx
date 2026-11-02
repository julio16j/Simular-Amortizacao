import Link from "next/link";
import { ArrowRight, CalendarClock, Landmark, Scale } from "lucide-react";
export const disclaimer =
  "Esta ferramenta realiza projeções financeiras para fins educacionais e de planejamento. Os resultados podem divergir dos cálculos oficiais da instituição financeira em razão de indexadores, datas de atualização, seguros, regras contratuais e condições de utilização do FGTS.";
export default function EducationalContent() {
  return (
    <section className="educational" id="como-funciona">
      <div className="section-kicker">Entenda seu financiamento</div>
      <h2>Pequenas decisões. Menos tempo de dívida.</h2>
      <p className="section-description">
        Amortizar é antecipar a devolução de parte do valor que você deve.
        Entenda as opções para interpretar sua simulação com segurança.
      </p>
      <div className="learn-grid">
        <article className="learn-card">
          <span className="learn-icon">
            <CalendarClock size={21} />
          </span>
          <h3>Reduzir prazo ou prestação?</h3>
          <p>
            Reduzir o prazo antecipa a quitação. Reduzir a prestação alivia o
            orçamento mensal. Compare o efeito no custo futuro antes de decidir.
          </p>
          <Link href="/guias/reduzir-prazo-ou-prestacao/">
            Entenda a diferença <ArrowRight size={13} />
          </Link>
        </article>
        <article className="learn-card">
          <span className="learn-icon">
            <Scale size={21} />
          </span>
          <h3>Price e SAC, sem complicação</h3>
          <p>
            No Price, a prestação financeira é constante em um cenário sem
            reajustes. No SAC, a amortização do principal é constante e os juros
            diminuem.
          </p>
          <Link href="/guias/price-ou-sac/">
            Conheça os sistemas <ArrowRight size={13} />
          </Link>
        </article>
        <article className="learn-card">
          <span className="learn-icon">
            <Landmark size={21} />
          </span>
          <h3>Seu FGTS no planejamento</h3>
          <p>
            Projete os depósitos e o saldo disponível. Saque-aniversário e uso
            direto são movimentações distintas e não podem gastar os mesmos
            recursos duas vezes.
          </p>
          <Link href="/guias/amortizar-com-fgts/">
            Entenda as premissas <ArrowRight size={13} />
          </Link>
        </article>
      </div>
      <div className="faq">
        <h2>Dúvidas antes de simular?</h2>
        <details>
          <summary>
            Como simular uma amortização do financiamento imobiliário?
          </summary>
          <p>
            Informe o saldo devedor atualizado, as parcelas restantes, a taxa de
            juros e o sistema do seu contrato. Preencha o valor extra mensal e
            escolha reduzir prazo ou prestação. O simulador calcula cada mês com
            e sem os extras e compara as projeções. Confira TR, seguro e taxas
            nas opções avançadas.
          </p>
        </details>
        <details>
          <summary>O valor de amortização é pago além da parcela?</summary>
          <p>
            Sim. A amortização extra mensal é um pagamento adicional que reduz o
            principal depois da prestação daquele mês. No mês da quitação, o
            sistema aplica somente o valor necessário e registra o restante como
            não utilizado.
          </p>
        </details>
        <details>
          <summary>Posso simular um financiamento que já começou?</summary>
          <p>
            Sim. Use a opção “Em andamento” e o saldo devedor atual do banco,
            sem tentar reconstruí-lo pelo valor original do empréstimo. O
            simulador estima somente os pagamentos futuros a partir da próxima
            prestação.
          </p>
        </details>
        <details>
          <summary>
            Por que o resultado pode ser diferente do meu banco?
          </summary>
          <p>
            O contrato pode usar datas de atualização, juros diários, seguros
            variáveis e critérios de reajuste específicos. A TR futura também é
            desconhecida. Escolha as premissas mais próximas do contrato e
            confirme os valores de uma operação real com a instituição.
          </p>
        </details>
        <details>
          <summary>O rendimento do FGTS já inclui a TR?</summary>
          <p>
            O campo pede uma estimativa de rendimento anual total. Essa taxa é
            convertida em uma taxa mensal equivalente, sem somar a TR novamente.
            O rendimento futuro e a distribuição de resultados não são
            garantidos.
          </p>
        </details>
        <details>
          <summary>
            Preciso fazer cadastro ou informar meus dados pessoais?
          </summary>
          <p>
            Não. A simulação acontece no navegador, sem login, CPF ou envio dos
            valores financeiros pelo simulador. Você pode baixar o resultado em
            CSV, sem salvamento automático das simulações. O site integra o
            Google AdSense para publicidade; consulte a{" "}
            <Link href="/privacidade/">política de privacidade</Link> para
            conhecer o tratamento de dados por serviços externos.
          </p>
        </details>
      </div>
      <p className="disclaimer">
        {disclaimer}{" "}
        <Link href="/metodologia/">
          Consulte metodologia, fontes e limitações.
        </Link>
      </p>
    </section>
  );
}
