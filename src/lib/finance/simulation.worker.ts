import { compareScenarios } from "./simulator";
import type { Scenario } from "./types";
self.onmessage = (event: MessageEvent<{ id: number; scenario: Scenario }>) => {
  const { id, scenario } = event.data;
  try {
    self.postMessage({ id, result: compareScenarios(scenario) });
  } catch (error) {
    self.postMessage({
      id,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível calcular a simulação.",
    });
  }
};
