/**
 * @quantum-party/quantum-engine
 *
 * Motor de estados cuánticos puro (sin React/three/DOM). Es el núcleo pedagógico verificable del
 * juego: sus resultados son deterministas (RNG sembrado inyectado) y se testean como invariantes.
 */
export * as complex from "./math/complex.js";
export { type Complex } from "./math/complex.js";
export { type Rng, createRng, sampleFromDistribution } from "./math/rng.js";

export * from "./statevector.js";
export * as gates from "./gates.js";
export { type Gate2x2 } from "./gates.js";

export * as superposition from "./superposition.js";
export { type CoherenceBar, type RealQubit } from "./superposition.js";
export * as interference from "./interference.js";
export * as entanglement from "./entanglement.js";
export * as annealing from "./annealing/index.js";

import { createRng, type Rng } from "./math/rng.js";
import * as superpositionNs from "./superposition.js";
import * as annealingNs from "./annealing/index.js";
import type { QUBO } from "./annealing/qubo.js";

/**
 * Fachada de alto nivel inyectada a cada minijuego vía `MinigameContext.quantum` (ver game-core).
 * Mantiene a los minijuegos desacoplados de los módulos internos y garantiza que reciban el `Rng`
 * sembrado de la partida.
 */
export interface QuantumEngineApi {
  readonly rng: Rng;
  /** Colapsa un qubit real de ángulo θ a 0/1. */
  collapse(theta: number): 0 | 1;
  /** Muestrea un índice de un mapa de calor probabilístico. */
  sampleHeatmap(weights: readonly number[]): number;
  /** Resuelve un QUBO por recocido simulado (fallback cliente). */
  anneal(qubo: QUBO, schedule?: annealingNs.AnnealSchedule): annealingNs.AnnealResult;
}

export function createQuantumEngine(seed: number): QuantumEngineApi {
  const rng = createRng(seed);
  return {
    rng,
    collapse: (theta: number) => superpositionNs.collapse({ theta }, rng),
    sampleHeatmap: (weights) => superpositionNs.sampleHeatmap(rng, weights),
    anneal: (qubo, schedule) => annealingNs.simulatedAnneal(qubo, rng, schedule),
  };
}
