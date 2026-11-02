import { ChevronDown, House, Info, Plus, Trash2, Wallet } from "lucide-react";
import type { FgtsConfig, Financing, Scenario } from "../lib/finance/types";
import { CheckField, DateField, NumberField, SelectField } from "./Fields";
import { money } from "../lib/format";

export default function FinancingForm({
  scenario,
  onChange,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}) {
  const f = scenario.financing,
    g = scenario.fgts;
  function financing<K extends keyof Financing>(key: K, value: Financing[K]) {
    onChange({ ...scenario, financing: { ...f, [key]: value } });
  }
  function fgts<K extends keyof FgtsConfig>(key: K, value: FgtsConfig[K]) {
    onChange({ ...scenario, fgts: { ...g, [key]: value } });
  }
  const monthly = scenario.extras[0];
  return (
    <>
      <section className="form-section">
        <div className="section-heading">
          <span className="step">01</span>
          <h2>Seu financiamento</h2>
          <House size={18} />
        </div>
        <div className="segmented" aria-label="Tipo de financiamento">
          <button
            type="button"
            aria-pressed={f.mode === "ongoing"}
            onClick={() => financing("mode", "ongoing")}
          >
            Em andamento
          </button>
          <button
            type="button"
            aria-pressed={f.mode === "new"}
            onClick={() => financing("mode", "new")}
          >
            Contrato novo
          </button>
        </div>
        <NumberField
          label={
            f.mode === "ongoing" ? "Saldo devedor atual" : "Valor a financiar"
          }
          value={f.mode === "ongoing" ? f.balance : f.originalPrincipal}
          onChange={(n) =>
            financing(f.mode === "ongoing" ? "balance" : "originalPrincipal", n)
          }
          suffix="R$"
          required
          hint={
            f.mode === "ongoing"
              ? "Use o saldo atualizado do seu contrato."
              : "Valor do empréstimo, sem a entrada."
          }
        />
        <div className="field-grid">
          <NumberField
            label={
              f.mode === "ongoing" ? "Parcelas restantes" : "Prazo em meses"
            }
            value={f.mode === "ongoing" ? f.remainingMonths : f.originalTerm}
            step={1}
            min={1}
            max={1200}
            required
            suffix="meses"
            onChange={(n) =>
              onChange({
                ...scenario,
                financing:
                  f.mode === "ongoing"
                    ? {
                        ...f,
                        remainingMonths: n,
                        originalTerm: n + f.paidMonths,
                      }
                    : {
                        ...f,
                        originalTerm: n,
                        remainingMonths: n,
                        paidMonths: 0,
                      },
              })
            }
          />
          <SelectField
            label="Sistema"
            value={f.system}
            onChange={(v) => financing("system", v)}
            options={[
              ["PRICE", "Tabela Price"],
              ["SAC", "SAC"],
            ]}
          />
        </div>
        <div className="field-grid">
          <NumberField
            label="Taxa de juros"
            value={f.rate}
            onChange={(n) => financing("rate", n)}
            suffix="%"
            max={100}
            step={0.0001}
          />
          <SelectField
            label="Periodicidade"
            value={f.ratePeriod}
            onChange={(v) => financing("ratePeriod", v)}
            options={[
              ["annual", "Ao ano"],
              ["monthly", "Ao mês"],
            ]}
          />
        </div>
        <div className="field-grid">
          <SelectField
            label="Tipo de taxa"
            value={f.rateType}
            onChange={(v) => financing("rateType", v)}
            options={[
              ["effective", "Efetiva"],
              ["nominal", "Nominal"],
            ]}
          />
          <DateField
            label="Próxima prestação"
            value={f.firstDue}
            onChange={(v) => financing("firstDue", v)}
          />
        </div>
        <details className="advanced">
          <summary>
            TR, prestação e dados do contrato
            <ChevronDown size={16} />
          </summary>
          <div className="advanced-body">
            <div className="field-grid">
              <SelectField
                label="Indexador"
                value={f.indexer}
                onChange={(v) => financing("indexer", v)}
                options={[
                  ["none", "Sem correção"],
                  ["TR", "TR estimada"],
                ]}
              />
              <NumberField
                label="TR anual estimada"
                value={f.trAnnual}
                onChange={(v) => financing("trAnnual", v)}
                suffix="%"
                max={100}
                step={0.0001}
              />
            </div>
            <div className="presets" aria-label="Premissas ilustrativas de TR">
              {[
                [0.5, "Otimista"],
                [1.5, "Base"],
                [2.5, "Conservador"],
                [0, "Zero"],
              ].map(([n, label]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() =>
                    onChange({
                      ...scenario,
                      financing: { ...f, indexer: "TR", trAnnual: Number(n) },
                    })
                  }
                >
                  {label} · {n}%
                </button>
              ))}
            </div>
            <p className="helper">
              Cenários ilustrativos, sem previsão oficial. Você pode editar a
              taxa acima.
            </p>
            <SelectField
              label="Reajuste da prestação pela TR"
              value={f.adjustment}
              onChange={(v) => financing("adjustment", v)}
              options={[
                ["indexed", "Corrigir referência mensal pela TR"],
                ["fixed", "Manter referência sem reajuste"],
                ["recalculate", "Recalcular pelo saldo e prazo restante"],
              ]}
              hint="Escolha uma hipótese compatível com seu contrato. Não é uma regra universal da Caixa."
            />
            <details>
              <summary>TR diferente por ano</summary>
              <div className="advanced-body">
                {f.trByYear.map((tr, i) => (
                  <div className="inline-row" key={i}>
                    <NumberField
                      label="Ano"
                      value={tr.year}
                      step={1}
                      min={1900}
                      max={2300}
                      onChange={(n) =>
                        financing(
                          "trByYear",
                          f.trByYear.map((t, j) =>
                            j === i ? { ...t, year: n } : t,
                          ),
                        )
                      }
                    />
                    <NumberField
                      label="TR anual (%)"
                      value={tr.rate}
                      max={100}
                      step={0.0001}
                      onChange={(n) =>
                        financing(
                          "trByYear",
                          f.trByYear.map((t, j) =>
                            j === i ? { ...t, rate: n } : t,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Remover TR do ano ${tr.year}`}
                      onClick={() =>
                        financing(
                          "trByYear",
                          f.trByYear.filter((_, j) => i !== j),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    financing("trByYear", [
                      ...f.trByYear,
                      {
                        year:
                          Number(f.firstDue.slice(0, 4)) + f.trByYear.length,
                        rate: f.trAnnual,
                      },
                    ])
                  }
                >
                  <Plus size={15} /> Adicionar ano
                </button>
              </div>
            </details>
            <div className="field-grid">
              <NumberField
                label="Seguro mensal"
                value={f.insurance}
                onChange={(n) => financing("insurance", n)}
                suffix="R$"
              />
              <NumberField
                label="Taxa administrativa mensal"
                value={f.adminFee}
                onChange={(n) => financing("adminFee", n)}
                suffix="R$"
              />
            </div>
            <div className="field-grid">
              <NumberField
                label="Reajuste anual do seguro"
                value={f.insuranceGrowth}
                onChange={(n) => financing("insuranceGrowth", n)}
                suffix="%"
                max={100}
              />
              <NumberField
                label="Reajuste anual das taxas"
                value={f.feeGrowth}
                onChange={(n) => financing("feeGrowth", n)}
                suffix="%"
                max={100}
              />
            </div>
            <NumberField
              label="Prestação atual, se conhecida"
              value={f.informedPayment}
              onChange={(n) => financing("informedPayment", n)}
              suffix="R$"
            />
            <CheckField
              checked={f.paymentIncludesCharges}
              onChange={(v) => financing("paymentIncludesCharges", v)}
            >
              Seguro e taxa já estão na prestação informada
            </CheckField>
            <SelectField
              label="Prestação usada no cálculo"
              value={f.paymentReference}
              onChange={(v) => financing("paymentReference", v)}
              options={[
                ["theoretical", "Usar prestação teórica"],
                ["informed", "Usar prestação informada"],
              ]}
              hint="A informada é respeitada e pode levar a um prazo diferente. Encargos são separados antes do cálculo."
            />
            <div className="field-grid">
              <NumberField
                label="Valor original do imóvel"
                value={f.propertyValue}
                onChange={(n) => financing("propertyValue", n)}
                suffix="R$"
              />
              <NumberField
                label="Avaliação bancária"
                value={f.bankValuation}
                onChange={(n) => financing("bankValuation", n)}
                suffix="R$"
              />
            </div>
            <div className="field-grid">
              <NumberField
                label="Valor originalmente financiado"
                value={f.originalPrincipal}
                onChange={(n) => financing("originalPrincipal", n)}
                suffix="R$"
              />
              <NumberField
                label="Entrada (opcional)"
                value={f.downPayment}
                onChange={(n) => financing("downPayment", n)}
                suffix="R$"
              />
            </div>
            {f.mode === "ongoing" && (
              <div className="field-grid">
                <NumberField
                  label="Prazo original"
                  value={f.originalTerm}
                  step={1}
                  min={1}
                  max={1200}
                  onChange={(n) =>
                    onChange({
                      ...scenario,
                      financing: {
                        ...f,
                        originalTerm: n,
                        remainingMonths: n - f.paidMonths,
                      },
                    })
                  }
                />
                <NumberField
                  label="Parcelas já pagas"
                  value={f.paidMonths}
                  step={1}
                  max={1199}
                  onChange={(n) =>
                    onChange({
                      ...scenario,
                      financing: {
                        ...f,
                        paidMonths: n,
                        remainingMonths: f.originalTerm - n,
                      },
                    })
                  }
                />
              </div>
            )}
            <NumberField
              label="Taxa efetiva anual do contrato (informativa)"
              value={f.reportedEffectiveAnnual}
              max={100}
              step={0.0001}
              onChange={(n) => financing("reportedEffectiveAnnual", n)}
              suffix="%"
              hint="Referência para conferência; a taxa escolhida nos campos principais rege a simulação."
            />
          </div>
        </details>
      </section>
      <section className="form-section">
        <div className="section-heading">
          <span className="step">02</span>
          <h2>Amortização mensal</h2>
          <Wallet size={18} />
        </div>
        <NumberField
          label="Amortização extra mensal"
          value={monthly?.amount ?? 0}
          suffix="R$"
          onChange={(amount) =>
            onChange({
              ...scenario,
              extras: [
                {
                  id: "mensal",
                  amount,
                  start: f.firstDue,
                  frequency: "monthly",
                  interval: 1,
                  reduction: monthly?.reduction ?? "term",
                },
              ],
            })
          }
          hint="Valor além da prestação, a partir da próxima parcela. Use zero para não amortizar."
        />
        <SelectField
          label="Objetivo da amortização"
          value={monthly?.reduction ?? "term"}
          onChange={(reduction) =>
            onChange({
              ...scenario,
              extras: [
                {
                  id: "mensal",
                  amount: monthly?.amount ?? 0,
                  start: f.firstDue,
                  frequency: "monthly",
                  interval: 1,
                  reduction,
                },
              ],
            })
          }
          options={[
            ["term", "Reduzir prazo"],
            ["payment", "Reduzir prestação"],
          ]}
        />
      </section>
      <section className="form-section fgts-section">
        <div className="section-heading">
          <span className="step">03</span>
          <h2>Estratégia com FGTS</h2>
        </div>
        <CheckField checked={g.enabled} onChange={(v) => fgts("enabled", v)}>
          Incluir FGTS na estratégia
        </CheckField>
        {g.enabled && (
          <div>
            <p className="helper">
              {g.modality === "birthday" && g.birthdayDestination === "amortize"
                ? "Saque-aniversário para amortizar."
                : "Projeção do fundo habilitada."}{" "}
              Saldo: {money(g.balance * 100)} · depósitos:{" "}
              {money(g.monthlyDeposit * 100)}/mês.
            </p>
            <details className="advanced">
              <summary>
                Configurar FGTS e saques
                <ChevronDown size={16} />
              </summary>
              <div className="fgts-fields">
                <div className="field-grid">
                  <NumberField
                    label="Saldo atual do FGTS"
                    value={g.balance}
                    onChange={(n) => fgts("balance", n)}
                    suffix="R$"
                  />
                  <NumberField
                    label="Depósito mensal"
                    value={g.monthlyDeposit}
                    onChange={(n) => fgts("monthlyDeposit", n)}
                    suffix="R$"
                  />
                </div>
                <div className="field-grid">
                  <NumberField
                    label="Rendimento anual total"
                    value={g.annualReturn}
                    onChange={(n) => fgts("annualReturn", n)}
                    suffix="%"
                    max={100}
                  />
                  <DateField
                    label="Início da projeção FGTS"
                    value={g.start}
                    onChange={(v) => fgts("start", v)}
                  />
                </div>
                <SelectField
                  label="Modalidade de saque"
                  value={g.modality}
                  onChange={(v) => fgts("modality", v)}
                  options={[
                    ["termination", "Saque-rescisão"],
                    ["birthday", "Saque-aniversário"],
                  ]}
                />
                {g.modality === "birthday" && (
                  <>
                    <SelectField
                      label="Mês do aniversário"
                      value={String(g.birthdayMonth)}
                      onChange={(v) => fgts("birthdayMonth", Number(v))}
                      options={[
                        "Janeiro",
                        "Fevereiro",
                        "Março",
                        "Abril",
                        "Maio",
                        "Junho",
                        "Julho",
                        "Agosto",
                        "Setembro",
                        "Outubro",
                        "Novembro",
                        "Dezembro",
                      ].map((label, i) => [String(i + 1), label] as const)}
                    />
                    <SelectField
                      label="Destino do saque-aniversário"
                      value={g.birthdayDestination}
                      onChange={(v) => fgts("birthdayDestination", v)}
                      options={[
                        ["amortize", "Amortizar o financiamento"],
                        ["save", "Guardar fora do FGTS"],
                        ["ignore", "Não considerar o saque"],
                      ]}
                    />
                    <DateField
                      label="Considerar saques a partir de"
                      value={g.birthdayFirst}
                      onChange={(v) => fgts("birthdayFirst", v)}
                    />
                    <CheckField
                      checked={g.birthdayBlocked}
                      onChange={(v) => fgts("birthdayBlocked", v)}
                    >
                      Saques-aniversário comprometidos ou bloqueados
                    </CheckField>
                  </>
                )}
                <CheckField
                  checked={g.directEnabled}
                  onChange={(v) => fgts("directEnabled", v)}
                >
                  Usar saldo livre do FGTS periodicamente
                </CheckField>
                {g.directEnabled && (
                  <>
                    <div className="field-grid">
                      <DateField
                        label="Primeiro uso direto"
                        value={g.firstUse}
                        onChange={(v) => fgts("firstUse", v)}
                      />
                      <NumberField
                        label="Intervalo pretendido"
                        value={g.interval}
                        onChange={(n) => fgts("interval", n)}
                        suffix="meses"
                        min={1}
                        max={1200}
                        step={1}
                      />
                    </div>
                    <CheckField
                      checked={g.eligible}
                      onChange={(v) => fgts("eligible", v)}
                    >
                      Assumir elegibilidade para simular o uso direto
                    </CheckField>
                    <p className="inline-note">
                      <Info size={16} /> Esta é uma premissa, não uma
                      autorização. Confirme requisitos do trabalhador, imóvel e
                      contrato com o banco.
                    </p>
                  </>
                )}
                <SelectField
                  label="Objetivo das amortizações FGTS"
                  value={g.reduction}
                  onChange={(v) => fgts("reduction", v)}
                  options={[
                    ["term", "Reduzir prazo"],
                    ["payment", "Reduzir prestação"],
                  ]}
                />
                <details className="advanced">
                  <summary>
                    Disponibilidade e ordem das operações
                    <ChevronDown size={16} />
                  </summary>
                  <div className="advanced-body">
                    <NumberField
                      label="Saldo inicial bloqueado"
                      value={g.blockedBalance}
                      onChange={(n) => fgts("blockedBalance", n)}
                      suffix="R$"
                    />
                    <div className="field-grid">
                      <NumberField
                        label="Depósitos futuros considerados"
                        value={g.depositPercent}
                        onChange={(n) => fgts("depositPercent", n)}
                        suffix="%"
                        max={100}
                      />
                      <NumberField
                        label="Reajuste anual do depósito"
                        value={g.depositGrowth}
                        onChange={(n) => fgts("depositGrowth", n)}
                        suffix="%"
                        max={100}
                      />
                    </div>
                    <NumberField
                      label="Intervalo mínimo permitido"
                      value={g.minimumInterval}
                      onChange={(n) => fgts("minimumInterval", n)}
                      suffix="meses"
                      min={24}
                      max={1200}
                      step={1}
                      hint="Mínimo usual de 24 meses nesta versão. Exceções não são modeladas."
                    />
                    <DateField
                      label="Último uso direto anterior (opcional)"
                      value={g.lastUse}
                      onChange={(v) => fgts("lastUse", v)}
                      optional
                    />
                    <SelectField
                      label="Ordem das utilizações"
                      value={g.order}
                      onChange={(v) => fgts("order", v)}
                      options={[
                        [
                          "birthday-first",
                          "Saque-aniversário antes do uso direto",
                        ],
                        [
                          "direct-first",
                          "Uso direto antes do saque-aniversário",
                        ],
                      ]}
                    />
                    <SelectField
                      label="Acumulação do FGTS"
                      value={g.accrualOrder}
                      onChange={(v) => fgts("accrualOrder", v)}
                      options={[
                        ["yield-first", "Rendimento e depois depósito"],
                        ["deposit-first", "Depósito e depois rendimento"],
                      ]}
                    />
                  </div>
                </details>
              </div>
            </details>
          </div>
        )}
      </section>
    </>
  );
}
