import Decimal from "decimal.js";
export const D = Decimal.clone({
  precision: 36,
  rounding: Decimal.ROUND_HALF_UP,
});
export function safeCents(value: number) {
  if (!Number.isSafeInteger(value))
    throw new RangeError(
      "A projeção ultrapassou o limite seguro de valores monetários. Reduza taxas, valores ou horizonte e simule novamente.",
    );
  return value;
}
export const cents = (value: number | string) =>
  rounded(new D(value).times(100));
export const rounded = (value: Decimal.Value) =>
  safeCents(new D(value).toDecimalPlaces(0).toNumber());
export function monthlyRate(
  rate: number,
  type: "nominal" | "effective" = "effective",
  period: "annual" | "monthly" = "annual",
) {
  const r = new D(rate).div(100);
  return period === "monthly"
    ? r
    : type === "nominal"
      ? r.div(12)
      : r.plus(1).pow(new D(1).div(12)).minus(1);
}
export function pricePayment(
  principal: number,
  rate: Decimal.Value,
  months: number,
): number {
  return rounded(pricePaymentExact(principal, rate, months));
}
export function pricePaymentExact(
  principal: number,
  rate: Decimal.Value,
  months: number,
) {
  const r = new D(rate);
  if (months <= 0) return new D(principal);
  if (r.isZero()) return new D(principal).div(months);
  return new D(principal).times(r).div(new D(1).minus(r.plus(1).pow(-months)));
}
export function remainingTerm(
  balance: number,
  rate: Decimal.Value,
  payment: number,
) {
  const r = new D(rate);
  if (!balance) return 0;
  if (r.isZero()) return Math.ceil(balance / Math.max(1, payment));
  if (new D(payment).lte(new D(balance).times(r))) return 1200;
  return new D(1)
    .minus(new D(balance).times(r).div(payment))
    .ln()
    .neg()
    .div(r.plus(1).ln())
    .ceil()
    .toNumber();
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export const monthKey = (date: string) =>
  Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;
/** Always anchor on the original due day, including after February. */
export function addMonths(date: string, count: number) {
  const year = Number(date.slice(0, 4)),
    month = Number(date.slice(5, 7)) - 1,
    day = Number(date.slice(8, 10));
  const end = new Date(Date.UTC(year, month + count + 1, 0));
  return new Date(
    Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      Math.min(day, end.getUTCDate()),
    ),
  )
    .toISOString()
    .slice(0, 10);
}
