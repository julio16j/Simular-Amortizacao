import { D, rounded } from "./math";
/** Official annual withdrawal table; unrelated to loans anticipating future withdrawals. */
export const birthdayBands = [
  { limit: 50000, rate: 0.5, additional: 0 },
  { limit: 100000, rate: 0.4, additional: 5000 },
  { limit: 500000, rate: 0.3, additional: 15000 },
  { limit: 1000000, rate: 0.2, additional: 65000 },
  { limit: 1500000, rate: 0.15, additional: 115000 },
  { limit: 2000000, rate: 0.1, additional: 190000 },
  { limit: Infinity, rate: 0.05, additional: 290000 },
];
export function birthdayAmount(balanceInCents: number) {
  const balance = Math.max(0, balanceInCents);
  const band = birthdayBands.find((b) => balance <= b.limit)!;
  return Math.min(
    balance,
    rounded(new D(balance).times(band.rate).plus(band.additional)),
  );
}
