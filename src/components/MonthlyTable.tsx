"use client";
import { Fragment, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { MonthRow } from "../lib/finance/types";
import { money, dateBR, monthBR } from "../lib/format";
const detailFields: [keyof MonthRow, string][] = [
  ["openingBalance", "Saldo inicial"],
  ["correction", "Correção TR"],
  ["correctedBalance", "Saldo corrigido"],
  ["interest", "Juros apropriados"],
  ["interestPaid", "Juros pagos"],
  ["capitalizedInterest", "Juros capitalizados"],
  ["ordinaryPrincipal", "Amortização ordinária"],
  ["financialPayment", "Prestação financeira"],
  ["insurance", "Seguro"],
  ["adminFee", "Taxa administrativa"],
  ["installment", "Prestação total"],
  ["ownRecurring", "Extras recorrentes"],
  ["ownOneOff", "Extras pontuais"],
  ["birthdayApplied", "Saque-aniversário aplicado"],
  ["fgtsApplied", "FGTS direto"],
  ["totalPrincipal", "Amortização total"],
  ["closingBalance", "Saldo final"],
  ["fgtsOpening", "FGTS inicial"],
  ["fgtsDeposit", "Depósito FGTS"],
  ["fgtsYield", "Rendimento FGTS"],
  ["birthdayWithdrawal", "Saque-aniversário retirado"],
  ["birthdaySaved", "Saque guardado fora do FGTS"],
  ["fgtsClosing", "FGTS final"],
  ["cumulativeInterest", "Juros acumulados"],
  ["cumulativeCorrection", "TR acumulada"],
  ["cumulativePaid", "Total pago acumulado"],
];
const PAGE_SIZE = 12;
export default function MonthlyTable({ rows }: { rows: MonthRow[] }) {
  const [year, setYear] = useState("all"),
    [page, setPage] = useState(0),
    [expanded, setExpanded] = useState<number | null>(null);
  const years = [...new Set(rows.map((r) => r.date.slice(0, 4)))];
  const filtered =
    year === "all" ? rows : rows.filter((r) => r.date.startsWith(year));
  const pages = Math.ceil(filtered.length / PAGE_SIZE),
    safePage = Math.min(page, Math.max(0, pages - 1));
  const visible = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const [exporting, setExporting] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  async function exportCsv() {
    setExporting(true);
    try {
      const { downloadCsv } = await import("../lib/export/csv");
      downloadCsv(rows);
    } finally {
      setExporting(false);
    }
  }
  return (
    <section className="card">
      <div className="table-top">
        <div>
          <h3>Resumo anual completo</h3>
          <p className="helper" style={{ margin: "4px 0 0" }}>
            A evolução do seu financiamento, ano a ano, até o fim da projeção.
          </p>
        </div>
        <div className="table-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={exportCsv}
            disabled={exporting}
          >
            <Download size={14} />
            {exporting ? "Exportando…" : "Baixar CSV"}
          </button>
        </div>
      </div>
      <div
        className="table-scroll"
        role="region"
        aria-label="Resumo anual"
        tabIndex={0}
      >
        <table>
          <caption className="sr-only">
            Totais anuais de toda a projeção
          </caption>
          <thead>
            <tr>
              <th scope="col">Ano</th>
              <th scope="col">Juros</th>
              <th scope="col">TR</th>
              <th scope="col">Principal</th>
              <th scope="col">Seguros e taxas</th>
              <th scope="col">Extras próprios</th>
              <th scope="col">FGTS aplicado</th>
              <th scope="col">Total pago</th>
              <th scope="col">Saldo FGTS</th>
              <th scope="col">Saldo devedor</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              const months = rows.filter((r) => r.date.startsWith(y));
              const sum = (get: (r: MonthRow) => number) =>
                months.reduce((a, r) => a + get(r), 0);
              return (
                <tr key={y}>
                  <td>{y}</td>
                  <td>{money(sum((r) => r.interest))}</td>
                  <td>{money(sum((r) => r.correction))}</td>
                  <td>{money(sum((r) => r.totalPrincipal))}</td>
                  <td>{money(sum((r) => r.insurance + r.adminFee))}</td>
                  <td>{money(sum((r) => r.ownRecurring + r.ownOneOff))}</td>
                  <td>
                    {money(sum((r) => r.birthdayApplied + r.fgtsApplied))}
                  </td>
                  <td>
                    {money(
                      sum(
                        (r) =>
                          r.installment +
                          r.ownRecurring +
                          r.ownOneOff +
                          r.birthdayApplied +
                          r.fgtsApplied,
                      ),
                    )}
                  </td>
                  <td>{money(months.at(-1)!.fgtsClosing)}</td>
                  <td>{money(months.at(-1)!.closingBalance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        className="secondary-button monthly-toggle"
        type="button"
        aria-expanded={showMonthly}
        aria-controls="monthly-evolution"
        onClick={() => setShowMonthly(!showMonthly)}
      >
        <ChevronDown
          size={16}
          style={{ transform: showMonthly ? "rotate(180deg)" : undefined }}
        />
        {showMonthly ? "Recolher mês a mês" : "Ver mês a mês"}
      </button>
      <div id="monthly-evolution" hidden={!showMonthly}>
        <div className="table-top monthly-heading">
          <div>
            <h3>Evolução mês a mês</h3>
            <p className="helper" style={{ margin: "4px 0 0" }}>
              Abra um mês para conferir a memória de cálculo.
            </p>
          </div>
          <div className="table-actions">
            <select
              aria-label="Filtrar evolução por ano"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">Todos os anos</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div
          className="table-scroll"
          role="region"
          aria-label="Evolução mensal, role horizontalmente para mais colunas"
          tabIndex={0}
        >
          <table>
            <caption className="sr-only">
              Evolução mensal da estratégia selecionada. Valores em reais.
            </caption>
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Prestação</th>
                <th scope="col">Juros</th>
                <th scope="col">Extras + FGTS</th>
                <th scope="col">Saldo devedor</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <Fragment key={r.month}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="row-expand"
                        aria-expanded={expanded === r.month}
                        aria-controls={`month-${r.month}`}
                        onClick={() =>
                          setExpanded(expanded === r.month ? null : r.month)
                        }
                      >
                        <ChevronDown
                          size={12}
                          style={{
                            transform:
                              expanded === r.month
                                ? "rotate(180deg)"
                                : undefined,
                          }}
                        />
                        <span>
                          {String(r.month).padStart(2, "0")} · {monthBR(r.date)}
                        </span>
                      </button>
                    </td>
                    <td>{money(r.installment)}</td>
                    <td>{money(r.interest)}</td>
                    <td>
                      {money(
                        r.ownRecurring +
                          r.ownOneOff +
                          r.birthdayApplied +
                          r.fgtsApplied,
                      )}
                    </td>
                    <td>{money(r.closingBalance)}</td>
                  </tr>
                  {expanded === r.month && (
                    <tr className="row-detail" id={`month-${r.month}`}>
                      <td colSpan={5}>
                        <p className="helper">
                          Competência {monthBR(r.date)} · vencimento{" "}
                          {dateBR(r.date)}
                        </p>
                        <div className="month-detail">
                          {detailFields.map(([key, label]) => (
                            <div key={key}>
                              <span>{label}</span>
                              <strong>{money(Number(r[key]))}</strong>
                            </div>
                          ))}
                          <div>
                            <span>
                              Diferença de arredondamento (TR + juros)
                            </span>
                            <strong>
                              {r.roundingDifference
                                .toFixed(8)
                                .replace(".", ",")}{" "}
                              centavos
                            </strong>
                          </div>
                        </div>
                        <div className="month-events">
                          {r.events.map((e, i) => (
                            <p key={i}>
                              {e.label} ·{" "}
                              {e.reduction === "term"
                                ? "redução de prazo"
                                : "redução de prestação"}
                              : solicitado {money(e.requested)}, aplicado{" "}
                              {money(e.applied)} e não utilizado{" "}
                              {money(e.unused)}.
                            </p>
                          ))}
                          {r.notes.map((n) => (
                            <p key={n}>{n}</p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>
            {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de{" "}
            {filtered.length} meses
          </span>
          <div>
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={safePage >= pages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
