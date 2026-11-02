import { describe, expect, it } from "vitest";
import { defaultScenario, demoScenario } from "../../src/data/scenarios";
import {
  addMonths,
  cents,
  monthlyRate,
  pricePayment,
} from "../../src/lib/finance/math";
import { birthdayAmount } from "../../src/lib/finance/fgts";
import { compareScenarios, simulate } from "../../src/lib/finance/simulator";
import { validateScenario } from "../../src/lib/finance/validators";
import { toCsv } from "../../src/lib/export/csv";
import type { Scenario } from "../../src/lib/finance/types";

function fixture(): Scenario {
  const s = defaultScenario();
  s.extras = [];
  s.financing = {
    ...s.financing,
    balance: 12000,
    originalPrincipal: 12000,
    originalTerm: 12,
    remainingMonths: 12,
    paidMonths: 0,
    paymentReference: "theoretical",
    informedPayment: 0,
    rate: 1,
    ratePeriod: "monthly",
    indexer: "none",
    firstDue: "2026-01-31",
    adjustment: "fixed",
  };
  s.fgts = {
    ...s.fgts,
    enabled: false,
    balance: 0,
    monthlyDeposit: 0,
    modality: "termination",
    directEnabled: true,
  };
  s.fgts.start = "2026-01-01";
  s.fgts.firstUse = "2026-01-01";
  s.fgts.birthdayFirst = "2026-01-01";
  return s;
}
const extra = (amount = 1000) => ({
  id: "a",
  amount,
  start: "2026-01-01",
  frequency: "once" as const,
  interval: 1,
  reduction: "term" as const,
});

describe("Fórmulas independentes e sistemas", () => {
  it("Price coincide com a soma descontada dos fluxos", () => {
    const s = fixture(),
      r = simulate(s);
    const pmt = (12000 * 0.01) / (1 - 1.01 ** -12);
    expect(r.theoreticalPayment / 100).toBeCloseTo(pmt, 2);
    expect(r.rows).toHaveLength(12);
    expect(r.paidOff).toBe(true);
    const pv = r.rows.reduce(
      (sum, row, idx) => sum + row.financialPayment / 100 / 1.01 ** (idx + 1),
      0,
    );
    expect(pv).toBeCloseTo(12000, 1);
  });
  it("SAC mantém amortização constante e juros decrescentes", () => {
    const s = fixture();
    s.financing.system = "SAC";
    const r = simulate(s);
    expect(r.rows).toHaveLength(12);
    expect(r.rows[0].ordinaryPrincipal).toBe(100000);
    expect(r.rows[0].financialPayment).toBe(112000);
    expect(r.rows.at(-1)!.financialPayment).toBe(101000);
    expect(r.totals.interest).toBe(78000);
  });
  it("converte nominal, efetiva e mensal sem confundir unidades", () => {
    expect(monthlyRate(12, "nominal").toNumber()).toBe(0.01);
    expect(monthlyRate(12).toNumber()).toBeCloseTo(1.12 ** (1 / 12) - 1, 12);
    expect(monthlyRate(1, "effective", "monthly").toNumber()).toBe(0.01);
  });
  it("taxa zero divide o principal e ajusta a última parcela", () => {
    expect(pricePayment(10000, 0, 3)).toBe(3333);
    const s = fixture();
    s.financing.balance = 100;
    s.financing.rate = 0;
    const r = simulate(s);
    expect(r.totals.interest).toBe(0);
    expect(r.totals.cost).toBe(10000);
    expect(r.rows).toHaveLength(12);
  });
  it("TR é composta e aplicada antes dos juros", () => {
    const s = fixture();
    s.financing.indexer = "TR";
    s.financing.trAnnual = 12.68250301319698;
    const row = simulate(s).rows[0];
    expect(row.correction).toBe(12000);
    expect(row.interest).toBe(12120);
  });
  it("TR anual específica sobrepõe a taxa padrão", () => {
    const s = fixture();
    s.financing.indexer = "TR";
    s.financing.trByYear = [{ year: 2026, rate: 0 }];
    expect(simulate(s).totals.correction).toBe(0);
  });
  it("saldo em andamento prevalece e novo contrato usa o financiado", () => {
    const s = fixture();
    s.financing.originalPrincipal = 20000;
    expect(simulate(s).initialBalance).toBe(1200000);
    s.financing.mode = "new";
    expect(simulate(s).initialBalance).toBe(2000000);
  });
  it("separa prestação informada dos encargos", () => {
    const s = fixture();
    s.financing.paymentReference = "informed";
    s.financing.informedPayment = 1200;
    s.financing.insurance = 20;
    s.financing.adminFee = 10;
    const r = simulate(s);
    expect(r.referencePayment).toBe(117000);
    expect(r.rows[0].installment).toBe(120000);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

describe("Amortizações e calendário", () => {
  it("amortização única reduz prazo e juros", () => {
    const s = fixture();
    s.extras = [extra(4000)];
    const c = compareScenarios(s);
    expect(c.monthsSaved).toBeGreaterThan(0);
    expect(c.interestSaved).toBeGreaterThan(0);
    expect(c.strategy.rows[1].financialPayment).toBe(
      c.baseline.rows[1].financialPayment,
    );
  });
  it("redução de prestação mantém prazo e recalcula o saldo restante", () => {
    const s = fixture();
    s.extras = [{ ...extra(), reduction: "payment" }];
    const c = compareScenarios(s);
    expect(c.strategy.rows).toHaveLength(12);
    const expected =
      ((c.strategy.rows[0].closingBalance / 100) * 0.01) / (1 - 1.01 ** -11);
    expect(c.strategy.rows[1].financialPayment / 100).toBeCloseTo(expected, 2);
  });
  it.each(["term", "payment"] as const)(
    "SAC com redução de %s",
    (reduction) => {
      const s = fixture();
      s.financing.system = "SAC";
      s.extras = [{ ...extra(3000), reduction }];
      const r = simulate(s);
      expect(r.paidOff).toBe(true);
      expect(r.rows.length).toBe(reduction === "term" ? 9 : 12);
      if (reduction === "payment")
        expect(r.rows[1].ordinaryPrincipal).toBe(72727);
    },
  );
  it("combina mensal, anual, intervalo e datas pontuais", () => {
    const s = fixture();
    s.extras = [
      { ...extra(10), frequency: "monthly" },
      { ...extra(20), id: "b", start: "2026-03-15" },
      { ...extra(5), id: "c", frequency: "interval", interval: 2 },
      { ...extra(30), id: "d", frequency: "annual", start: "2026-06-01" },
    ];
    const r = simulate(s);
    expect(r.rows[0].ownRecurring).toBe(1500);
    expect(r.rows[1].ownRecurring).toBe(1000);
    expect(r.rows[2].ownOneOff).toBe(2000);
    expect(r.rows[5].ownRecurring).toBe(4000);
  });
  it("quita cedo, limita extras, registra excedente e interrompe cobranças", () => {
    const s = fixture();
    s.extras = [extra(50000)];
    const r = simulate(s);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].closingBalance).toBe(0);
    expect(r.rows[0].events[0].unused).toBeGreaterThan(0);
    expect(r.totals.principalRepaid).toBe(1200000);
  });
  it("última prestação é menor e não produz saldo negativo", () => {
    const s = fixture();
    s.extras = [{ ...extra(500), frequency: "monthly" }];
    const r = simulate(s);
    expect(r.rows.at(-1)!.financialPayment).toBeLessThanOrEqual(
      r.rows[0].financialPayment,
    );
    expect(r.rows.every((row) => row.closingBalance >= 0)).toBe(true);
  });
  it("preserva dia âncora após fevereiro e anos bissextos", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-01-31", 2)).toBe("2026-03-31");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
  });
});

describe("FGTS e conservação de recursos", () => {
  it.each([
    [500, 250],
    [1000, 450],
    [5000, 1650],
    [10000, 2650],
    [15000, 3400],
    [20000, 3900],
    [30000, 4400],
  ])("saque de %s reais = %s", (balance, expected) => {
    expect(birthdayAmount(cents(balance))).toBe(cents(expected));
  });
  it.each([500, 1000, 5000, 10000, 15000, 20000])(
    "limite e centavo seguinte à faixa %s",
    (balance) => {
      expect(birthdayAmount(cents(balance) + 1)).toBeGreaterThanOrEqual(
        birthdayAmount(cents(balance)),
      );
      expect(
        birthdayAmount(cents(balance) + 1) - birthdayAmount(cents(balance)),
      ).toBeLessThanOrEqual(1);
    },
  );
  it("acumula rendimento sobre saldo inicial e depósitos mensais", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      directEnabled: false,
      balance: 1000,
      monthlyDeposit: 100,
      annualReturn: 12.68250301319698,
    };
    const row = simulate(s).rows[0];
    expect(row.fgtsYield).toBe(1000);
    expect(row.fgtsClosing).toBe(111000);
  });
  it("ordem de depósito e rendimento é configurável", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      directEnabled: false,
      balance: 1000,
      monthlyDeposit: 100,
      annualReturn: 12.68250301319698,
      accrualOrder: "deposit-first",
    };
    expect(simulate(s).rows[0].fgtsYield).toBe(1100);
  });
  it("saque-aniversário seguido de FGTS usa cada real apenas uma vez", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 3000,
      annualReturn: 0,
      modality: "birthday",
      birthdayMonth: 1,
    };
    const row = simulate(s).rows[0];
    expect(row.birthdayApplied).toBe(105000);
    expect(row.fgtsApplied).toBe(195000);
    expect(row.fgtsClosing).toBe(0);
  });
  it("inverter ordem altera saque e mantém conservação", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 3000,
      annualReturn: 0,
      modality: "birthday",
      birthdayMonth: 1,
      order: "direct-first",
    };
    const row = simulate(s).rows[0];
    expect(row.birthdayApplied).toBe(0);
    expect(row.fgtsApplied).toBe(300000);
  });
  it("FGTS insuficiente não gera saldo negativo", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 20,
      annualReturn: 0,
    };
    const row = simulate(s).rows[0];
    expect(row.fgtsApplied).toBe(2000);
    expect(row.fgtsClosing).toBe(0);
  });
  it("bloqueia usos antes do intervalo e respeita última utilização", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 100,
      monthlyDeposit: 10,
      interval: 1,
      annualReturn: 0,
      lastUse: "2025-12-01",
    };
    const r = simulate(s);
    expect(r.totals.fgts).toBe(0);
    expect(r.rows[0].notes.join()).toContain("intervalo mínimo");
  });
  it("aplica novamente após 24 meses e bloqueia as tentativas intermediárias", () => {
    const s = fixture();
    s.financing.originalTerm = 60;
    s.financing.remainingMonths = 60;
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 100,
      monthlyDeposit: 10,
      interval: 1,
      annualReturn: 0,
    };
    const r = simulate(s);
    expect(r.rows[0].fgtsApplied).toBe(11000);
    expect(r.rows[23].fgtsApplied).toBe(0);
    expect(r.rows[24].fgtsApplied).toBe(24000);
  });
  it("respeita saldo bloqueado e elegibilidade", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 1000,
      blockedBalance: 800,
      annualReturn: 0,
    };
    expect(simulate(s).rows[0].fgtsApplied).toBe(20000);
    s.fgts.eligible = false;
    expect(simulate(s).totals.fgts).toBe(0);
  });
  it("saque guardado sai do FGTS mas não entra no custo da dívida", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      directEnabled: false,
      balance: 3000,
      annualReturn: 0,
      modality: "birthday",
      birthdayMonth: 1,
      birthdayDestination: "save",
    };
    const r = simulate(s),
      plain = simulate({ ...s, fgts: { ...s.fgts, enabled: false } });
    expect(r.totals.birthdaySaved).toBe(105000);
    expect(r.totals.cost).toBe(plain.totals.cost);
  });
  it("não desconta mais FGTS do que a dívida exige", () => {
    const s = fixture();
    s.fgts = {
      ...s.fgts,
      enabled: true,
      eligible: true,
      balance: 50000,
      annualReturn: 0,
    };
    const r = simulate(s);
    expect(r.rows[0].fgtsClosing).toBe(5000000 - r.rows[0].fgtsApplied);
    expect(r.paidOff).toBe(true);
  });
});

describe("Consistência e limites", () => {
  it("interrompe projeções extremas antes de perder precisão em centavos", () => {
    const s = fixture();
    s.financing.originalTerm = 1200;
    s.financing.remainingMonths = 1200;
    s.financing.rate = 0;
    s.fgts = {
      ...s.fgts,
      enabled: true,
      directEnabled: false,
      balance: 1e9,
      monthlyDeposit: 1e9,
      annualReturn: 100,
    };
    expect(() => simulate(s)).toThrow("limite seguro de valores monetários");
  });
  it.each(["PRICE", "SAC"] as const)(
    "reconcilia cada mês e todos os fluxos de %s",
    (system) => {
      const s = demoScenario();
      s.financing.system = system;
      s.fgts.eligible = true;
      const snapshot = JSON.stringify(s),
        r = simulate(s);
      expect(r.paidOff).toBe(true);
      for (const row of r.rows) {
        expect(row.closingBalance).toBe(
          row.openingBalance +
            row.correction +
            row.capitalizedInterest -
            row.totalPrincipal,
        );
        expect(row.fgtsClosing).toBe(
          row.fgtsOpening +
            row.fgtsDeposit +
            row.fgtsYield -
            row.birthdayWithdrawal -
            row.fgtsApplied,
        );
        expect(row.installment).toBe(
          row.interestPaid +
            row.ordinaryPrincipal +
            row.insurance +
            row.adminFee,
        );
      }
      expect(r.totals.cost).toBe(r.totals.ownResources + r.totals.fgts);
      expect(r.totals.principalRepaid).toBe(
        r.initialBalance + r.totals.correction + r.totals.capitalizedInterest,
      );
      expect(JSON.stringify(s)).toBe(snapshot);
      expect(simulate(s)).toEqual(r);
    },
  );
  it("projeção continua além de 120 meses", () => {
    const s = demoScenario();
    s.extras = [];
    s.fgts.enabled = false;
    expect(simulate(s).rows.length).toBeGreaterThan(120);
  });
  it.each(["PRICE", "SAC"] as const)(
    "preserva prazo teórico com TR indexada em %s",
    (system) => {
      const s = defaultScenario();
      s.extras = [];
      s.financing.system = system;
      s.financing.originalTerm = 360;
      s.financing.paidMonths = 0;
      s.financing.remainingMonths = 360;
      s.financing.paymentReference = "theoretical";
      s.fgts.enabled = false;
      const r = simulate(s);
      expect(r.paidOff).toBe(true);
      expect(r.rows.length).toBe(360);
    },
  );
  it("não inventa quitação para prestação insuficiente", () => {
    const s = fixture();
    s.financing.paymentReference = "informed";
    s.financing.informedPayment = 1;
    const r = compareScenarios(s);
    expect(r.strategy.paidOff).toBe(false);
    expect(r.interestSaved).toBeNull();
    expect(r.strategy.totals.capitalizedInterest).toBeGreaterThan(0);
  });
  it("rejeita entradas inválidas", () => {
    const s = fixture();
    s.financing.firstDue = "2026-02-30";
    s.financing.balance = -1;
    expect(validateScenario(s).length).toBeGreaterThan(0);
    expect(() => simulate(s)).toThrow();
  });
  it("CSV inclui projeção completa e colunas de auditoria", () => {
    const r = simulate(fixture()),
      csv = toCsv(r.rows);
    expect(csv).toContain("Saldo inicial");
    expect(csv).toContain("Arredondamento em centavos");
    expect(csv.split("\r\n")).toHaveLength(r.rows.length + 1);
  });
});
