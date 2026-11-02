const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const money = (centavos: number) => brl.format(centavos / 100);
export const shortMoney = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(centavos / 100);
export const dateBR = (iso: string | null) =>
  iso ? iso.split("-").reverse().join("/") : "Não quitado";
export const monthBR = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
export function duration(months: number) {
  const years = Math.floor(months / 12),
    remaining = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  if (remaining || !years)
    parts.push(`${remaining} ${remaining === 1 ? "mês" : "meses"}`);
  return parts.join(" e ");
}
