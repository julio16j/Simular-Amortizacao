"use client";
import { useId, useState } from "react";
import { money, monthBR, shortMoney } from "../lib/format";
import type { Simulation } from "../lib/finance/types";
export default function BalanceChart({
  baseline,
  strategy,
}: {
  baseline: Simulation;
  strategy: Simulation;
}) {
  const [selected, setSelected] = useState(0);
  const id = useId().replaceAll(":", "");
  const count = Math.max(baseline.rows.length, strategy.rows.length);
  const max = Math.max(
    baseline.initialBalance,
    ...baseline.rows.map((r) => r.closingBalance),
    ...strategy.rows.map((r) => r.closingBalance),
  );
  const left = 53,
    top = 16,
    width = 590,
    height = 195;
  const x = (i: number) => left + (i / Math.max(count, 1)) * width;
  const y = (v: number) => top + height * (1 - v / max);
  function path(s: Simulation) {
    const points = [
      s.initialBalance,
      ...Array.from(
        { length: count },
        (_, i) =>
          s.rows[i]?.closingBalance ??
          (s.paidOff ? 0 : s.rows.at(-1)!.closingBalance),
      ),
    ];
    return points
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(v).toFixed(2)}`)
      .join(" ");
  }
  const active = Math.min(selected, count);
  const b =
    active === 0
      ? baseline.initialBalance
      : (baseline.rows[active - 1]?.closingBalance ?? 0);
  const s =
    active === 0
      ? strategy.initialBalance
      : (strategy.rows[active - 1]?.closingBalance ?? 0);
  const selectedDate =
    baseline.rows[Math.max(0, active - 1)]?.date ??
    strategy.rows[Math.max(0, active - 1)]?.date;
  return (
    <div className="card">
      <div className="card-title">
        <div>
          <h3>Evolução do saldo devedor</h3>
          <p>Veja sua dívida diminuir ao longo do tempo.</p>
        </div>
        <span>Projeção mensal</span>
      </div>
      <div className="legend">
        <span>
          <i style={{ background: "#a4b4c3" }} />
          Sem amortização extra
        </span>
        <span>
          <i style={{ background: "#098264" }} />
          Sua estratégia
        </span>
      </div>
      <svg
        className="chart-svg"
        viewBox="0 0 660 245"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>Comparação do saldo devedor</title>
        <desc id={`${id}-desc`}>
          Saldo inicial de {money(strategy.initialBalance)}. Use o controle
          abaixo para consultar valores por mês. Todos os valores também estão
          na tabela.
        </desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c9674" stopOpacity=".16" />
            <stop offset="100%" stopColor="#0c9674" stopOpacity=".01" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={left}
              x2={left + width}
              y1={y(max * f)}
              y2={y(max * f)}
              stroke="#eaf0f2"
              strokeDasharray="3 4"
            />
            <text x={left - 9} y={y(max * f) + 4} textAnchor="end">
              {shortMoney(max * f)}
            </text>
          </g>
        ))}
        <path
          d={`${path(strategy)} L${x(count)},${top + height} L${left},${top + height} Z`}
          fill={`url(#${id}-fill)`}
        />
        <path
          d={path(baseline)}
          fill="none"
          stroke="#a4b4c3"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <path
          d={path(strategy)}
          fill="none"
          stroke="#098264"
          strokeWidth="2.5"
        />
        <line
          x1={x(active)}
          x2={x(active)}
          y1={top}
          y2={top + height}
          stroke="#bdd6ca"
          strokeDasharray="3 3"
        />
        <circle
          cx={x(active)}
          cy={y(s)}
          r="4"
          fill="#098264"
          stroke="white"
          strokeWidth="2"
        />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={f}
            x={x(Math.round(count * f))}
            y={234}
            textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
          >
            {Math.round(count * f) === 0
              ? "Hoje"
              : `${Math.round(count * f)} meses`}
          </text>
        ))}
      </svg>
      <label className="chart-range-label" htmlFor={`${id}-month`}>
        Explorar mês
        <input
          id={`${id}-month`}
          aria-label="Mês da projeção no gráfico"
          type="range"
          min={0}
          max={count}
          value={active}
          onChange={(e) => setSelected(Number(e.target.value))}
        />
      </label>
      <div className="chart-readout">
        <span>
          {active === 0 ? "Saldo inicial" : monthBR(selectedDate)} · mês{" "}
          {active}
        </span>
        <span>
          Sem extras: <strong>{money(b)}</strong>
        </span>
        <span>
          Sua estratégia: <strong>{money(s)}</strong>
        </span>
      </div>
    </div>
  );
}
