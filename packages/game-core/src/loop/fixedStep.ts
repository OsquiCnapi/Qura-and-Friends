/**
 * Loop de paso fijo con acumulador (60 Hz lógico), desacoplado del render.
 *
 * `useFrame` de R3F entrega un delta variable según el refresh (60/120/144 Hz). Para que la simulación
 * sea determinista y el scoring justo entre dispositivos, se acumula el tiempo real y se ejecuta un
 * número entero de pasos fijos; el sobrante se devuelve como `alpha` para interpolar el dibujo.
 */
export interface FixedStepLoop {
  readonly fixedDt: number;
  /**
   * Consume `realDtSeconds`, ejecuta `step(fixedDt)` las veces necesarias y devuelve el factor de
   * interpolación `alpha ∈ [0, 1)` para el render.
   */
  advance(realDtSeconds: number, step: (fixedDt: number) => void): number;
  reset(): void;
}

export function createFixedStepLoop(hz = 60, maxSubSteps = 5): FixedStepLoop {
  const fixedDt = 1 / hz;
  let accumulator = 0;

  return {
    fixedDt,
    advance(realDtSeconds, step) {
      // Evita la "espiral de la muerte" si el frame se congela (pestaña en segundo plano).
      accumulator += Math.min(realDtSeconds, fixedDt * maxSubSteps);
      let steps = 0;
      while (accumulator >= fixedDt && steps < maxSubSteps) {
        step(fixedDt);
        accumulator -= fixedDt;
        steps++;
      }
      return accumulator / fixedDt;
    },
    reset() {
      accumulator = 0;
    },
  };
}
