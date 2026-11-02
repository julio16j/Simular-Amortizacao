import {
  addMonths,
  cents,
  D,
  monthKey,
  monthlyRate,
  pricePayment,
  pricePaymentExact,
  remainingTerm,
  rounded,
  safeCents,
} from "./math";
import { birthdayAmount } from "./fgts";
import { validateScenario } from "./validators";
import type {
  ExtraPayment,
  MonthRow,
  Reduction,
  Scenario,
  Simulation,
} from "./types";

export function isDue(event: ExtraPayment, date: string) {
  const delta = monthKey(date) - monthKey(event.start);
  if (delta < 0 || (event.end && monthKey(date) > monthKey(event.end)))
    return false;
  if (event.frequency === "once") return delta === 0;
  const every =
    event.frequency === "annual"
      ? 12
      : event.frequency === "monthly"
        ? 1
        : event.interval;
  return delta % every === 0;
}

export function simulate(input: Scenario): Simulation {
  const errors = validateScenario(input);
  if (errors.length) throw new Error(errors.join(" "));
  const f = input.financing,
    g = input.fgts;
  const rate = monthlyRate(f.rate, f.rateType, f.ratePeriod);
  const fgtsRate = monthlyRate(g.annualReturn);
  const initial = cents(f.mode === "new" ? f.originalPrincipal : f.balance);
  const term = f.mode === "new" ? f.originalTerm : f.remainingMonths;
  let balance = initial,
    remaining = term;
  let sacPrincipal = rounded(new D(balance).div(term));
  const theoretical =
    f.system === "PRICE"
      ? pricePayment(balance, rate, term)
      : sacPrincipal + rounded(new D(balance).times(rate));
  const informed =
    cents(f.informedPayment) -
    (f.paymentIncludesCharges ? cents(f.insurance) + cents(f.adminFee) : 0);
  let reference = f.paymentReference === "informed" ? informed : theoretical;
  let referenceExact =
    f.paymentReference === "informed"
      ? new D(informed)
      : pricePaymentExact(balance, rate, term);
  let sacExact = new D(balance).div(term);
  const referencePayment = reference;
  if (f.system === "SAC" && f.paymentReference === "informed") {
    sacPrincipal = Math.max(0, reference - rounded(new D(balance).times(rate)));
    sacExact = new D(sacPrincipal);
  }
  const warnings: string[] = [];
  if (f.adjustment === "recalculate" && f.paymentReference === "informed")
    warnings.push(
      "O recálculo mensal pelo saldo e prazo substitui a prestação informada já na primeira competência. Para preservá-la como referência, escolha reajuste indexado ou fixo.",
    );
  if (f.informedPayment > 0 && Math.abs(informed - theoretical) > 100)
    warnings.push(
      `A prestação financeira informada difere da teórica. Referência escolhida: ${f.paymentReference === "informed" ? "informada; o prazo pode divergir do contrato" : "teórica; a projeção pode divergir do boleto"}.`,
    );
  if (g.enabled) {
    warnings.push(
      "FGTS projetado: elegibilidade, datas e saldo disponível devem ser confirmados com o agente financeiro. Rendimento estimado; distribuição de resultados não garantida.",
    );
    if (!g.eligible && g.directEnabled)
      warnings.push(
        "Uso direto do FGTS desativado no cálculo: falta confirmar a premissa de elegibilidade.",
      );
    if (g.interval < g.minimumInterval)
      warnings.push(
        "O intervalo pretendido é inferior ao mínimo: tentativas antecipadas serão bloqueadas.",
      );
    if (g.blockedBalance > 0 || g.birthdayBlocked)
      warnings.push(
        "Recursos bloqueados foram restringidos na projeção. Contratos de antecipação e desbloqueios futuros não são calculados.",
      );
  }
  let fgts = g.enabled ? cents(g.balance) : 0;
  const blocked = cents(g.blockedBalance);
  let lastUse = g.lastUse ? monthKey(g.lastUse) : -Infinity;
  let cumulativeInterest = 0,
    cumulativeCorrection = 0,
    cumulativePaid = 0;
  const rows: MonthRow[] = [];
  const accrue = (date: string) => {
    if (!g.enabled || monthKey(date) < monthKey(g.start))
      return { deposit: 0, yieldAmount: 0 };
    const elapsed = monthKey(date) - monthKey(g.start);
    const deposit = rounded(
      new D(cents(g.monthlyDeposit))
        .times(g.depositPercent)
        .div(100)
        .times(
          new D(1)
            .plus(new D(g.depositGrowth).div(100))
            .pow(Math.floor(elapsed / 12)),
        ),
    );
    const yieldAmount = rounded(
      new D(fgts + (g.accrualOrder === "deposit-first" ? deposit : 0)).times(
        fgtsRate,
      ),
    );
    fgts = safeCents(fgts + deposit + yieldAmount);
    return { deposit, yieldAmount };
  };
  // Project the fund before the first loan installment when the user starts it earlier.
  // Mortgage applications before the first installment cannot be replayed: reject below.
  if (
    g.enabled &&
    monthKey(g.firstUse) < monthKey(f.firstDue) &&
    g.directEnabled
  )
    throw new Error(
      "A primeira utilização direta deve ocorrer a partir da próxima prestação. Informe o saldo já atualizado para operações anteriores.",
    );
  for (
    let k = 0;
    g.enabled && k < monthKey(f.firstDue) - monthKey(g.start);
    k++
  ) {
    const date = addMonths(g.start, k);
    accrue(date);
    if (
      g.modality === "birthday" &&
      g.birthdayDestination !== "ignore" &&
      !g.birthdayBlocked &&
      monthKey(date) >= monthKey(g.birthdayFirst) &&
      Number(date.slice(5, 7)) === g.birthdayMonth
    ) {
      // Outside the loan horizon, withdrawn funds are external to the starting loan balance.
      fgts -= Math.min(Math.max(0, fgts - blocked), birthdayAmount(fgts));
    }
  }
  for (let m = 0; m < 1200 && balance > 0; m++) {
    const date = addMonths(f.firstDue, m),
      key = monthKey(date);
    const trAnnual =
      f.indexer === "TR"
        ? (f.trByYear.find((t) => t.year === Number(date.slice(0, 4)))?.rate ??
          f.trAnnual)
        : 0;
    const tr = monthlyRate(trAnnual);
    const openingBalance = balance;
    const rawCorrection = new D(balance).times(tr);
    const correction = rounded(rawCorrection);
    const correctedBalance = balance + correction;
    if (f.adjustment === "indexed") {
      referenceExact = referenceExact.times(tr.plus(1));
      sacExact = sacExact.times(tr.plus(1));
      reference = rounded(referenceExact);
      sacPrincipal = rounded(sacExact);
    } else if (f.adjustment === "recalculate") {
      referenceExact = pricePaymentExact(
        correctedBalance,
        rate,
        Math.max(1, remaining),
      );
      sacExact = new D(correctedBalance).div(Math.max(1, remaining));
      reference = rounded(referenceExact);
      sacPrincipal = rounded(sacExact);
    }
    const rawInterest = new D(correctedBalance).times(rate);
    const interest = rounded(rawInterest);
    const scheduledPayment =
      f.system === "PRICE" ? reference : sacPrincipal + interest;
    let financialPayment = Math.min(
      correctedBalance + interest,
      scheduledPayment,
    );
    // Only a small cent rounding residue may be absorbed at scheduled maturity; never a balloon.
    if (
      remaining === 1 &&
      correctedBalance + interest - financialPayment <= term + 1 &&
      financialPayment >= interest
    )
      financialPayment = correctedBalance + interest;
    const interestPaid = Math.min(financialPayment, interest);
    const capitalizedInterest = interest - interestPaid;
    const ordinaryPrincipal = Math.max(0, financialPayment - interest);
    balance = safeCents(
      correctedBalance + capitalizedInterest - ordinaryPrincipal,
    );
    const insurance = rounded(
      new D(cents(f.insurance)).times(
        new D(1)
          .plus(new D(f.insuranceGrowth).div(100))
          .pow(Math.floor(m / 12)),
      ),
    );
    const adminFee = rounded(
      new D(cents(f.adminFee)).times(
        new D(1).plus(new D(f.feeGrowth).div(100)).pow(Math.floor(m / 12)),
      ),
    );
    const fgtsOpening = fgts;
    const accrual = accrue(date);
    const row: MonthRow = {
      month: m + 1,
      date,
      openingBalance,
      correction,
      correctedBalance,
      interest,
      interestPaid,
      capitalizedInterest,
      ordinaryPrincipal,
      financialPayment,
      insurance,
      adminFee,
      installment: financialPayment + insurance + adminFee,
      ownRecurring: 0,
      ownOneOff: 0,
      birthdayApplied: 0,
      fgtsApplied: 0,
      totalPrincipal: 0,
      closingBalance: 0,
      fgtsOpening,
      fgtsDeposit: accrual.deposit,
      fgtsYield: accrual.yieldAmount,
      birthdayWithdrawal: 0,
      birthdaySaved: 0,
      fgtsClosing: 0,
      cumulativeInterest: 0,
      cumulativeCorrection: 0,
      cumulativePaid: 0,
      roundingDifference: new D(correction)
        .minus(rawCorrection)
        .plus(new D(interest).minus(rawInterest))
        .toNumber(),
      events: [],
      notes: [],
    };
    remaining = Math.max(0, remaining - 1);
    const recalculate = (reduction: Reduction) => {
      if (balance <= 0) return;
      if (reduction === "payment") {
        referenceExact = pricePaymentExact(
          balance,
          rate,
          Math.max(1, remaining),
        );
        sacExact = new D(balance).div(Math.max(1, remaining));
        reference = rounded(referenceExact);
        sacPrincipal = rounded(sacExact);
      } else {
        remaining =
          f.system === "PRICE"
            ? remainingTerm(balance, rate, reference)
            : Math.ceil(balance / Math.max(1, sacPrincipal));
      }
    };
    const apply = (
      requested: number,
      source: "own" | "birthday" | "fgts",
      label: string,
      reduction: Reduction,
    ) => {
      const applied = Math.min(balance, requested);
      balance -= applied;
      row.events.push({
        source,
        label,
        requested,
        applied,
        unused: requested - applied,
        reduction,
      });
      if (applied > 0) recalculate(reduction);
      return applied;
    };
    for (const e of input.extras.filter((e) => isDue(e, date))) {
      const applied = apply(
        cents(e.amount),
        "own",
        e.frequency === "once"
          ? "Amortização pontual"
          : "Amortização recorrente",
        e.reduction,
      );
      if (e.frequency === "once") row.ownOneOff += applied;
      else row.ownRecurring += applied;
    }
    const birthday = () => {
      if (
        !g.enabled ||
        g.modality !== "birthday" ||
        g.birthdayDestination === "ignore" ||
        key < monthKey(g.start) ||
        key < monthKey(g.birthdayFirst) ||
        Number(date.slice(5, 7)) !== g.birthdayMonth
      )
        return;
      if (g.birthdayBlocked) {
        row.notes.push("Saque-aniversário bloqueado por restrição informada.");
        return;
      }
      const withdrawal = Math.min(
        Math.max(0, fgts - blocked),
        birthdayAmount(fgts),
      );
      fgts -= withdrawal;
      row.birthdayWithdrawal = withdrawal;
      if (g.birthdayDestination === "amortize")
        row.birthdayApplied = apply(
          withdrawal,
          "birthday",
          "Saque-aniversário",
          g.reduction,
        );
      row.birthdaySaved = withdrawal - row.birthdayApplied;
    };
    const direct = () => {
      const elapsed = key - monthKey(g.firstUse);
      if (
        !g.enabled ||
        !g.directEnabled ||
        key < monthKey(g.start) ||
        elapsed < 0 ||
        elapsed % g.interval !== 0 ||
        balance === 0
      )
        return;
      if (!g.eligible) {
        row.notes.push(
          "FGTS direto não aplicado: elegibilidade não confirmada como premissa.",
        );
        return;
      }
      if (key - lastUse < g.minimumInterval) {
        row.notes.push(
          "FGTS direto bloqueado pelo intervalo mínimo entre utilizações.",
        );
        return;
      }
      const available = Math.max(0, fgts - blocked);
      row.fgtsApplied = apply(available, "fgts", "FGTS direto", g.reduction);
      fgts -= row.fgtsApplied;
      if (row.fgtsApplied > 0) lastUse = key;
      else row.notes.push("Sem saldo livre de FGTS nesta competência.");
    };
    if (g.order === "birthday-first") {
      birthday();
      direct();
    } else {
      direct();
      birthday();
    }
    row.totalPrincipal =
      ordinaryPrincipal +
      row.ownRecurring +
      row.ownOneOff +
      row.birthdayApplied +
      row.fgtsApplied;
    row.closingBalance = balance;
    row.fgtsClosing = fgts;
    cumulativeInterest = safeCents(cumulativeInterest + interest);
    cumulativeCorrection = safeCents(cumulativeCorrection + correction);
    cumulativePaid = safeCents(
      cumulativePaid +
        row.installment +
        row.ownRecurring +
        row.ownOneOff +
        row.birthdayApplied +
        row.fgtsApplied,
    );
    row.cumulativeInterest = cumulativeInterest;
    row.cumulativeCorrection = cumulativeCorrection;
    row.cumulativePaid = cumulativePaid;
    rows.push(row);
    if (
      capitalizedInterest > 0 &&
      !warnings.includes(
        "A prestação não cobre os juros em parte da projeção; os juros não pagos foram incorporados ao saldo.",
      )
    )
      warnings.push(
        "A prestação não cobre os juros em parte da projeção; os juros não pagos foram incorporados ao saldo.",
      );
    if (balance > 1e14) {
      warnings.push(
        "Projeção interrompida por crescimento excessivo da dívida. Reveja as premissas.",
      );
      break;
    }
  }
  if (balance > 0)
    warnings.push(
      "Não houve quitação no limite de segurança de 1.200 meses. Valores são parciais; não representam custo até a quitação.",
    );
  const sum = (get: (row: MonthRow) => number) =>
    rows.reduce((acc, r) => acc + get(r), 0);
  const ownExtra = sum((r) => r.ownRecurring + r.ownOneOff),
    fgtsUsed = sum((r) => r.birthdayApplied + r.fgtsApplied);
  const installments = sum((r) => r.installment);
  return {
    rows,
    paidOff: balance === 0,
    payoffDate: balance === 0 ? rows.at(-1)!.date : null,
    initialBalance: initial,
    monthlyRate: rate.toNumber(),
    theoreticalPayment: theoretical,
    referencePayment,
    warnings,
    totals: {
      interest: cumulativeInterest,
      interestPaid: sum((r) => r.interestPaid),
      capitalizedInterest: sum((r) => r.capitalizedInterest),
      correction: cumulativeCorrection,
      ordinaryPrincipal: sum((r) => r.ordinaryPrincipal),
      insurance: sum((r) => r.insurance),
      adminFees: sum((r) => r.adminFee),
      installments,
      ownExtra,
      fgts: fgtsUsed,
      extraordinary: ownExtra + fgtsUsed,
      ownResources: installments + ownExtra,
      cost: cumulativePaid,
      principalRepaid: sum((r) => r.totalPrincipal),
      costRatio:
        f.originalPrincipal > 0
          ? cumulativePaid / cents(f.originalPrincipal)
          : 0,
      birthdaySaved: sum((r) => r.birthdaySaved),
      unused: sum((r) => r.events.reduce((a, e) => a + e.unused, 0)),
    },
  };
}

export function compareScenarios(scenario: Scenario) {
  const baseline = simulate({
    ...scenario,
    extras: [],
    fgts: { ...scenario.fgts, enabled: false },
  });
  const strategy = simulate(scenario);
  const complete = baseline.paidOff && strategy.paidOff;
  return {
    baseline,
    strategy,
    complete,
    monthsSaved: complete ? baseline.rows.length - strategy.rows.length : null,
    interestSaved: complete
      ? baseline.totals.interest - strategy.totals.interest
      : null,
  };
}
