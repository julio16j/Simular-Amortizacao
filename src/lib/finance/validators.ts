import { monthKey, validDate } from "./math";
import type { Scenario } from "./types";
export function validateScenario(s: Scenario): string[] {
  const errors: string[] = [];
  const f = s.financing,
    g = s.fgts;
  const money = (n: number, label: string) => {
    if (!Number.isFinite(n) || n < 0 || n > 1e9)
      errors.push(`${label}: informe um valor entre 0 e 1 bilhão.`);
  };
  Object.entries({
    "Saldo devedor": f.balance,
    "Valor financiado": f.originalPrincipal,
    "Valor do imóvel": f.propertyValue,
    Avaliação: f.bankValuation,
    Entrada: f.downPayment,
    Prestação: f.informedPayment,
    Seguro: f.insurance,
    "Taxa administrativa": f.adminFee,
  }).forEach(([label, n]) => money(n, label));
  if ((f.mode === "new" ? f.originalPrincipal : f.balance) <= 0)
    errors.push("Informe um saldo devedor ou valor financiado maior que zero.");
  for (const [n, label] of [
    [f.originalTerm, "Prazo original"],
    [f.remainingMonths, "Prazo restante"],
  ] as const)
    if (!Number.isInteger(n) || n < 1 || n > 1200)
      errors.push(`${label}: use de 1 a 1.200 meses.`);
  if (
    !Number.isInteger(f.paidMonths) ||
    f.paidMonths < 0 ||
    f.paidMonths >= f.originalTerm
  )
    errors.push("Parcelas pagas devem ser menores que o prazo original.");
  if (
    f.mode === "ongoing" &&
    f.paidMonths + f.remainingMonths !== f.originalTerm
  )
    errors.push(
      "Parcelas pagas e restantes devem somar o prazo original. Ajuste os prazos conforme o contrato atual.",
    );
  if (
    !validDate(f.firstDue) ||
    Number(f.firstDue.slice(0, 4)) < 1900 ||
    Number(f.firstDue.slice(0, 4)) > 2200
  )
    errors.push("Informe uma data de vencimento válida entre 1900 e 2200.");
  for (const [rate, label] of [
    [f.rate, "Juros"],
    [f.trAnnual, "TR"],
    [f.insuranceGrowth, "Reajuste do seguro"],
    [f.feeGrowth, "Reajuste das taxas"],
    [f.reportedEffectiveAnnual, "Taxa efetiva informada"],
  ] as const)
    if (!Number.isFinite(rate) || rate < 0 || rate > 100)
      errors.push(`${label}: informe uma taxa entre 0% e 100%.`);
  if (
    f.paymentReference === "informed" &&
    f.informedPayment <=
      (f.paymentIncludesCharges ? f.insurance + f.adminFee : 0)
  )
    errors.push("A prestação informada deve superar os encargos incluídos.");
  const years = new Set<number>();
  for (const tr of f.trByYear) {
    if (
      !Number.isInteger(tr.year) ||
      tr.year < 1900 ||
      tr.year > 2300 ||
      !Number.isFinite(tr.rate) ||
      tr.rate < 0 ||
      tr.rate > 100
    )
      errors.push("Confira os anos e taxas da TR personalizada.");
    if (years.has(tr.year))
      errors.push("Não repita o mesmo ano na TR personalizada.");
    years.add(tr.year);
  }
  for (const e of s.extras) {
    money(e.amount, "Amortização extra");
    if (
      !validDate(e.start) ||
      (e.end && (!validDate(e.end) || monthKey(e.end) < monthKey(e.start)))
    )
      errors.push("Confira as datas das amortizações extras.");
    if (!Number.isInteger(e.interval) || e.interval < 1 || e.interval > 1200)
      errors.push("O intervalo da amortização deve ser de 1 a 1.200 meses.");
  }
  if (g.enabled) {
    money(g.balance, "Saldo FGTS");
    money(g.monthlyDeposit, "Depósito FGTS");
    money(g.blockedBalance, "Saldo bloqueado");
    if (g.blockedBalance > g.balance)
      errors.push(
        "O saldo bloqueado não pode superar o saldo inicial do FGTS.",
      );
    if (
      !validDate(g.start) ||
      !validDate(g.firstUse) ||
      !validDate(g.birthdayFirst) ||
      (g.lastUse && !validDate(g.lastUse))
    )
      errors.push("Confira as datas do FGTS.");
    if (
      validDate(g.start) &&
      validDate(f.firstDue) &&
      Math.abs(monthKey(g.start) - monthKey(f.firstDue)) > 1200
    )
      errors.push(
        "O início da projeção FGTS deve estar a até 1.200 meses do financiamento.",
      );
    if (
      validDate(g.firstUse) &&
      validDate(g.start) &&
      monthKey(g.firstUse) < monthKey(g.start)
    )
      errors.push(
        "A primeira utilização do FGTS não pode anteceder o início da projeção do fundo.",
      );
    for (const interval of [g.interval, g.minimumInterval])
      if (!Number.isInteger(interval) || interval < 1 || interval > 1200)
        errors.push("Intervalos FGTS devem ser de 1 a 1.200 meses.");
    if (g.minimumInterval < 24)
      errors.push(
        "Esta versão usa o mínimo usual de 24 meses para amortização direta com FGTS. Exceções não são modeladas.",
      );
    if (
      !Number.isInteger(g.birthdayMonth) ||
      g.birthdayMonth < 1 ||
      g.birthdayMonth > 12
    )
      errors.push("Selecione um mês de aniversário válido.");
    for (const [n, label] of [
      [g.annualReturn, "Rendimento FGTS"],
      [g.depositGrowth, "Reajuste dos depósitos"],
      [g.depositPercent, "Percentual de depósitos"],
    ] as const)
      if (!Number.isFinite(n) || n < 0 || n > 100)
        errors.push(`${label}: use de 0 a 100%.`);
  }
  return [...new Set(errors)];
}
