import type { MonthRow } from "../finance/types";
const columns: [keyof MonthRow, string][] = [
  ["month", "Mês"],
  ["date", "Data"],
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
  ["birthdaySaved", "Saque guardado"],
  ["fgtsClosing", "FGTS final"],
  ["cumulativeInterest", "Juros acumulados"],
  ["cumulativeCorrection", "TR acumulada"],
  ["cumulativePaid", "Total pago acumulado"],
  ["roundingDifference", "Arredondamento em centavos"],
];
const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
export function toCsv(rows: MonthRow[]) {
  return (
    "\uFEFF" +
    [
      columns
        .map(([, title]) => quote(title))
        .concat('"Eventos e avisos"')
        .join(";"),
      ...rows.map((r) =>
        columns
          .map(([key]) => {
            if (key === "date")
              return quote(r.date.split("-").reverse().join("/"));
            if (key === "month") return String(r.month);
            return (Number(r[key]) / (key === "roundingDifference" ? 1 : 100))
              .toFixed(key === "roundingDifference" ? 8 : 2)
              .replace(".", ",");
          })
          .concat(
            quote(
              [
                ...r.notes,
                ...r.events.map(
                  (e) =>
                    `${e.label}: solicitado ${(e.requested / 100).toFixed(2)}, aplicado ${(e.applied / 100).toFixed(2)}, não utilizado ${(e.unused / 100).toFixed(2)}`,
                ),
              ].join(" | "),
            ),
          )
          .join(";"),
      ),
    ].join("\r\n")
  );
}
export function downloadCsv(rows: MonthRow[]) {
  const url = URL.createObjectURL(
    new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "simula-amortizacao.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
