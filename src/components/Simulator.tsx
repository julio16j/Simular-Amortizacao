"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Calculator,
  Check,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { defaultScenario, demoScenario } from "../data/scenarios";
import { validateScenario } from "../lib/finance/validators";
import type { Scenario } from "../lib/finance/types";
import FinancingForm from "./FinancingForm";
import Results, { type Comparison } from "./Results";

export default function Simulator() {
  const [scenario, setScenario] = useState(defaultScenario);
  const [result, setResult] = useState<{
    comparison: Comparison;
    scenario: Scenario;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [hasRun, setHasRun] = useState(false);
  const [example, setExample] = useState(false);
  const worker = useRef<Worker | null>(null),
    request = useRef(0),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const scenarioRequests = useRef(new Map<number, Scenario>());
  useEffect(() => {
    const instance = new Worker(
      new URL("../lib/finance/simulation.worker.ts", import.meta.url),
    );
    worker.current = instance;
    instance.onmessage = (
      event: MessageEvent<{ id: number; result?: Comparison; error?: string }>,
    ) => {
      if (event.data.id !== request.current) return;
      setBusy(false);
      if (event.data.error) {
        setErrors([event.data.error]);
        setResult(null);
      } else if (event.data.result) {
        setResult({
          comparison: event.data.result,
          scenario: scenarioRequests.current.get(event.data.id)!,
        });
        setErrors([]);
      }
      scenarioRequests.current.clear();
    };
    instance.onerror = () => {
      setBusy(false);
      setResult(null);
      setErrors([
        "O navegador não conseguiu executar o cálculo. Recarregue a página e tente novamente.",
      ]);
    };
    return () => {
      instance.terminate();
      worker.current = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  function calculate(next: Scenario) {
    if (timer.current) clearTimeout(timer.current);
    const id = ++request.current;
    next = {
      ...next,
      extras: next.extras.map((e) => ({
        ...e,
        start: next.financing.firstDue,
      })),
    };
    const issues = validateScenario(next);
    setErrors(issues);
    setResult(null);
    if (issues.length) {
      setBusy(false);
      return;
    }
    if (!worker.current) {
      setErrors(["Aguarde o carregamento da página e tente novamente."]);
      return;
    }
    setBusy(true);
    scenarioRequests.current.set(id, structuredClone(next));
    worker.current.postMessage({ id, scenario: next });
  }
  function change(next: Scenario) {
    setScenario(next);
    setExample(false);
    if (hasRun) {
      ++request.current;
      setBusy(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => calculate(next), 450);
    }
  }
  function loadExample() {
    const next = demoScenario();
    setScenario(next);
    setExample(true);
    setHasRun(true);
    calculate(next);
  }
  function reset() {
    ++request.current;
    if (timer.current) clearTimeout(timer.current);
    setScenario(defaultScenario());
    setResult(null);
    setErrors([]);
    setBusy(false);
    setHasRun(false);
    setExample(false);
  }
  return (
    <div className="workspace" id="simulador">
      <form
        className="form-panel"
        onSubmit={(event) => {
          event.preventDefault();
          setHasRun(true);
          calculate(scenario);
          if (window.innerWidth <= 760)
            resultRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }}
      >
        <div className="panel-top">
          <strong>Configure sua simulação</strong>
          <button type="button" className="text-button" onClick={loadExample}>
            <FlaskConical size={14} /> Carregar exemplo
          </button>
        </div>
        <FinancingForm scenario={scenario} onChange={change} />
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? (
              <LoaderCircle size={17} className="spinner" />
            ) : (
              <Calculator size={17} />
            )}
            {busy ? "Calculando sua projeção…" : "Simular amortização"}
            <ArrowRight size={16} />
          </button>
          <p className="form-footnote">
            <LockKeyhole size={11} /> Sem cadastro. Seus dados ficam com você.
          </p>
          <button
            type="button"
            className="text-button"
            onClick={reset}
            style={{
              display: "flex",
              margin: "8px auto 0",
              fontSize: 10,
              color: "#586e7a",
            }}
          >
            <RotateCcw size={11} /> Restaurar formulário
          </button>
        </div>
      </form>
      <section
        className="results-column"
        ref={resultRef}
        aria-label="Resultados da simulação"
        aria-busy={busy}
      >
        <div className="result-heading">
          <h2>Sua previsão</h2>
          <span className="status" role="status">
            <i />
            {busy
              ? "Calculando…"
              : result
                ? "Simulação atualizada"
                : "Pronto para simular"}
          </span>
        </div>
        {errors.length > 0 && (
          <div className="error-box" role="alert">
            <strong>Vamos conferir alguns dados?</strong>
            <ul>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {example && (
          <div className="notice">
            <FlaskConical size={16} />
            <p>
              Exemplo Caixa / Price carregado. O uso direto do FGTS exige marcar
              a premissa de elegibilidade. Não há autorização de movimentação.
            </p>
          </div>
        )}
        {result && !busy ? (
          <Results comparison={result.comparison} scenario={result.scenario} />
        ) : (
          <div className="result-empty">
            <div>
              <span className="empty-symbol">
                {busy ? (
                  <LoaderCircle size={34} className="spinner" />
                ) : (
                  <Calculator size={34} />
                )}
              </span>
              <h3>
                {busy
                  ? "Traçando o caminho até a quitação…"
                  : "Um plano para quitar sua casa."}
              </h3>
              <p>
                {busy
                  ? "Calculando cada mês do financiamento e comparando sua estratégia com o cenário sem amortizações."
                  : "Preencha os dados do financiamento e descubra o impacto de cada amortização no seu futuro."}
              </p>
              {!busy && (
                <button
                  type="button"
                  className="text-button"
                  onClick={loadExample}
                >
                  <Sparkles size={15} /> Explorar com um exemplo{" "}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="benefit-strip">
          <span>
            <ShieldCheck size={14} /> 100% no navegador
          </span>
          <span>
            <Check size={14} /> Price e SAC
          </span>
          <span>
            <ArrowDown size={14} /> Sem custos
          </span>
        </div>
      </section>
    </div>
  );
}
