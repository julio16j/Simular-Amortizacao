/** Inputs are in reais and percent. All monetary outputs are integer centavos. */
export type Reduction = "term" | "payment";
export interface ExtraPayment {
  id: string;
  amount: number;
  start: string;
  end?: string;
  frequency: "once" | "monthly" | "annual" | "interval";
  interval: number;
  reduction: Reduction;
}
export interface Financing {
  mode: "ongoing" | "new";
  system: "PRICE" | "SAC";
  propertyValue: number;
  bankValuation: number;
  originalPrincipal: number;
  downPayment: number;
  balance: number;
  originalTerm: number;
  paidMonths: number;
  remainingMonths: number;
  firstDue: string;
  rate: number;
  rateType: "nominal" | "effective";
  ratePeriod: "annual" | "monthly";
  reportedEffectiveAnnual: number;
  indexer: "none" | "TR";
  trAnnual: number;
  trByYear: { year: number; rate: number }[];
  adjustment: "indexed" | "fixed" | "recalculate";
  paymentReference: "theoretical" | "informed";
  informedPayment: number;
  paymentIncludesCharges: boolean;
  insurance: number;
  adminFee: number;
  insuranceGrowth: number;
  feeGrowth: number;
}
export interface FgtsConfig {
  enabled: boolean;
  balance: number;
  monthlyDeposit: number;
  depositPercent: number;
  depositGrowth: number;
  annualReturn: number;
  start: string;
  modality: "termination" | "birthday";
  birthdayMonth: number;
  birthdayDestination: "amortize" | "save" | "ignore";
  birthdayFirst: string;
  directEnabled: boolean;
  firstUse: string;
  lastUse: string;
  interval: number;
  minimumInterval: number;
  eligible: boolean;
  blockedBalance: number;
  birthdayBlocked: boolean;
  reduction: Reduction;
  order: "birthday-first" | "direct-first";
  accrualOrder: "yield-first" | "deposit-first";
}
export interface Scenario {
  financing: Financing;
  extras: ExtraPayment[];
  fgts: FgtsConfig;
}
export interface AppliedEvent {
  source: "own" | "birthday" | "fgts";
  label: string;
  requested: number;
  applied: number;
  unused: number;
  reduction: Reduction;
}
export interface MonthRow {
  month: number;
  date: string;
  openingBalance: number;
  correction: number;
  correctedBalance: number;
  interest: number;
  interestPaid: number;
  capitalizedInterest: number;
  ordinaryPrincipal: number;
  financialPayment: number;
  insurance: number;
  adminFee: number;
  installment: number;
  ownRecurring: number;
  ownOneOff: number;
  birthdayApplied: number;
  fgtsApplied: number;
  totalPrincipal: number;
  closingBalance: number;
  fgtsOpening: number;
  fgtsDeposit: number;
  fgtsYield: number;
  birthdayWithdrawal: number;
  birthdaySaved: number;
  fgtsClosing: number;
  cumulativeInterest: number;
  cumulativeCorrection: number;
  cumulativePaid: number;
  roundingDifference: number;
  events: AppliedEvent[];
  notes: string[];
}
export interface Simulation {
  rows: MonthRow[];
  paidOff: boolean;
  payoffDate: string | null;
  initialBalance: number;
  monthlyRate: number;
  theoreticalPayment: number;
  referencePayment: number;
  warnings: string[];
  totals: {
    interest: number;
    interestPaid: number;
    capitalizedInterest: number;
    correction: number;
    ordinaryPrincipal: number;
    insurance: number;
    adminFees: number;
    installments: number;
    ownExtra: number;
    fgts: number;
    extraordinary: number;
    ownResources: number;
    cost: number;
    principalRepaid: number;
    costRatio: number;
    birthdaySaved: number;
    unused: number;
  };
}
