"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  CalendarCheck,
  Clock3,
  Coins,
  Info,
  Printer,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import { dateBR, duration, money } from "../lib/format";
import type { compareScenarios } from "../lib/finance/simulator";
import type { Scenario } from "../lib/finance/types";
import MonthlyTable from "./MonthlyTable";
const BalanceChart = dynamic(() => import("./BalanceChart"), {
  loading: () => (
    <div className="card" style={{ height: 350 }}>
      <p className="helper">Carregando gráfico…</p>
    </div>
  ),
});
export type Comparison = ReturnType<typeof compareScenarios>;
export default function Results({
  comparison: c,
  scenario,
}: {
  comparison: Comparison;
  scenario: Scenario;
}) {
  const r = c.strategy,
    b = c.baseline;
  const labels: [string, string][] = [
    ["Saldo devedor inicial", money(r.initialBalance)],
    ["Principal amortizado (inclui correção)", money(r.totals.principalRepaid)],
    ["Juros apropriados", money(r.totals.interest)],
    ["Correção monetária pela TR", money(r.totals.correction)],
    ["Seguros", money(r.totals.insurance)],
    ["Taxas administrativas", money(r.totals.adminFees)],
    ["Total em prestações", money(r.totals.installments)],
    ["Amortizações extras totais", money(r.totals.extraordinary)],
    ["Extras com recursos próprios", money(r.totals.ownExtra)],
    ["FGTS total usado (direto + saque)", money(r.totals.fgts)],
    ["Recursos próprios totais", money(r.totals.ownResources)],
    ["Custo total da estratégia", money(r.totals.cost)],
    ["Custo total sem extras", money(b.totals.cost)],
    [
      "Custo / valor original financiado",
      r.totals.costRatio
        ? `${r.totals.costRatio.toFixed(2).replace(".", ",")} ×`
        : "Informe o valor financiado",
    ],
    ["Saldo FGTS na quitação ou fim", money(r.rows.at(-1)!.fgtsClosing)],
    ["Saques guardados fora do FGTS", money(r.totals.birthdaySaved)],
    ["Excedentes não aplicados", money(r.totals.unused)],
    ["Prestação financeira teórica inicial", money(r.theoreticalPayment)],
    ["Referência financeira inicial escolhida", money(r.referencePayment)],
    [
      "Nova prestação após o primeiro mês",
      r.rows[1] ? money(r.rows[1].installment) : "Quitado no primeiro mês",
    ],
    [
      "Diferença da prestação no 2º mês",
      r.rows[1] && b.rows[1]
        ? money(b.rows[1].installment - r.rows[1].installment)
        : "Não aplicável",
    ],
  ];
  return (
    <>
      <div className="saving-hero">
        <div>
          <span className="saving-label">
            <CalendarCheck size={16} />
            Com sua estratégia, você quita em
          </span>
          <strong>
            {r.paidOff ? duration(r.rows.length) : "Sem quitação projetada"}
          </strong>
          <p className="payoff-date">
            {r.paidOff
              ? `Quitação estimada em ${dateBR(r.payoffDate)}`
              : `A dívida não foi quitada nos ${r.rows.length} meses simulados.`}
          </p>
        </div>
        <div className="saving-time">
          <span className="saving-label">Tempo economizado</span>
          <strong>
            {c.monthsSaved === null
              ? "Não disponível"
              : `${c.monthsSaved} meses`}
          </strong>
          <p>
            {c.monthsSaved !== null && c.monthsSaved >= 12
              ? duration(c.monthsSaved)
              : "Cada passo conta."}
          </p>
        </div>
      </div>
      <div className="metric-grid">
        <div className="metric">
          <span className="metric-icon">
            <Clock3 size={16} />
          </span>
          <small>Prazo sem amortizações extras</small>
          <strong>{b.paidOff ? duration(b.rows.length) : "Não quitado"}</strong>
          <p>
            {b.paidOff
              ? `Até ${dateBR(b.payoffDate)}`
              : `${b.rows.length} meses simulados`}
          </p>
        </div>
        <div className="metric">
          <span className="metric-icon">
            <TrendingDown size={16} />
          </span>
          <small>Economia estimada de juros</small>
          <strong>
            {c.interestSaved === null
              ? "Não disponível"
              : money(c.interestSaved)}
          </strong>
          <p>Comparada ao cenário sem extras</p>
        </div>
        <div className="metric">
          <span className="metric-icon">
            <Coins size={16} />
          </span>
          <small>Amortizações extraordinárias</small>
          <strong>{money(r.totals.extraordinary)}</strong>
          <p>Recursos próprios + FGTS</p>
        </div>
      </div>
      {!c.complete && (
        <div className="notice warning" role="alert">
          <TriangleAlert size={17} />
          <p>
            Projeção incompleta. Os custos exibidos cobrem apenas os meses
            calculados. Não há comparação de economia até que ambos os cenários
            quitem a dívida.
          </p>
        </div>
      )}
      <BalanceChart baseline={b} strategy={r} />
      <div className="notice">
        <Info size={16} />
        <p>
          Valores estimados. TR, juros, seguros e regras do seu contrato podem
          mudar os resultados. Seus dados ficam neste navegador.
        </p>
      </div>
      {[...new Set([...b.warnings, ...r.warnings])].map((w) => (
        <div className="notice warning" key={w}>
          <Info size={15} />
          <p>{w}</p>
        </div>
      ))}
      <details className="card cost-details">
        <summary>Conferir custos, taxas e premissas</summary>
        <div className="cost-grid">
          {labels.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className="helper" style={{ marginTop: 16 }}>
          Juros contratuais: {scenario.financing.rate.toLocaleString("pt-BR")}%{" "}
          {scenario.financing.ratePeriod === "annual" ? "a.a." : "a.m."} (
          {scenario.financing.rateType === "nominal" ? "nominal" : "efetiva"}).
          Taxa mensal usada:{" "}
          {(r.monthlyRate * 100).toLocaleString("pt-BR", {
            maximumFractionDigits: 6,
          })}
          %. TR padrão:{" "}
          {scenario.financing.indexer === "TR"
            ? `${scenario.financing.trAnnual}% a.a.`
            : "sem correção"}
          ; taxas anuais específicas prevalecem quando informadas. Consulte a{" "}
          <Link href="/metodologia/">metodologia e a ordem das operações</Link>.
        </p>
        <p className="helper">
          O custo soma prestações, extras próprios e FGTS aplicado. A TR já está
          no saldo amortizado e não é somada novamente ao custo. Valores já
          pagos antes da projeção e a entrada não entram no custo futuro.
        </p>
      </details>
      <MonthlyTable key={`${r.payoffDate}-${r.rows.length}`} rows={r.rows} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          className="text-button"
          onClick={() => window.print()}
        >
          <Printer size={14} /> Imprimir resultados
        </button>
      </div>
    </>
  );
}
