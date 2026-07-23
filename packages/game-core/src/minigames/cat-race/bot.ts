/**
 * IA del bot de la Reina (Cobraveja): corre de forma **clásica** (no usa superposición) y es más lento
 * que los humanos. Su imperfección NO es un `random` cualquiera: decide si esquiva **midiendo un qubit**
 * (regla de Born). Prepara un qubit en un ángulo θ y lo colapsa: con probabilidad cos²θ acierta el
 * esquive, con sin²θ "falla" y choca. Así la aleatoriedad del bot es un concepto cuántico real y su
 * dificultad es superable — dando sentido pedagógico a la ventaja del jugador.
 */
import { superposition, type Rng } from "@quantum-party/quantum-engine";
import type { CatRaceConfig } from "./config.js";
import type { RunnerState } from "./state.js";

export interface BotDecision {
  /** Carril objetivo al que el bot intenta moverse (o el actual si no esquiva). */
  readonly targetLane: number;
}

/**
 * Decide el carril del bot. Si hay un obstáculo próximo en su carril, "mide un qubit" para decidir si
 * logra esquivar: probabilidad de éxito = cos²θ (regla de Born). Baja un poco con la dificultad para que
 * cometa más errores. El colapso usa el `Rng` sembrado → determinista y verificable.
 */
export function decideBotLane(
  runner: RunnerState,
  config: CatRaceConfig,
  rng: Rng,
  difficulty: number,
): BotDecision {
  const lookahead = 12;
  // Obstáculo más cercano por delante (en cualquier carril).
  const idx = config.obstacles.findIndex((o) => o.distance > runner.distance);
  const obs = idx >= 0 ? config.obstacles[idx] : undefined;
  if (!obs || obs.distance - runner.distance > lookahead || obs.lane !== runner.lane) {
    return { targetLane: runner.lane }; // nada cerca en su carril
  }

  // Mide UNA sola vez por obstáculo (si re-midiera cada frame, acabaría esquivando siempre).
  if (runner.botPlannedIdx !== idx) {
    runner.botPlannedIdx = idx;
    // Probabilidad de acierto alta → esquiva casi siempre, pero falla de vez en cuando.
    const pSuccess = Math.min(0.88, 0.72 + 0.05 * difficulty);
    // θ tal que cos²θ = pSuccess; medir |0⟩ = esquiva, |1⟩ = falla (regla de Born).
    const theta = Math.acos(Math.sqrt(pSuccess));
    runner.botPlannedDodge = superposition.collapse({ theta }, rng) === 0;
  }

  if (!runner.botPlannedDodge) {
    return { targetLane: runner.lane }; // colapsó a "falla" → no esquiva, chocará
  }
  const options = [runner.lane - 1, runner.lane + 1].filter((l) => l >= 0 && l < config.lanes);
  const target = options.length > 0 ? (rng.pick(options) as number) : runner.lane;
  return { targetLane: target };
}
