/**
 * Entrelazamiento — base de la Categoría 2.
 *
 * Fuente: `qbronze_docs/entanglement-protocols` (par de Bell `h(q1); cx(q1,q0)` → (|00⟩+|11⟩)/√2;
 * correlación de mediciones; teleportación). Aquí se exponen constructores de estados de Bell y la
 * lógica de correlación/anticorrelación que usan los minijuegos de control dual (Espejos Ciegos,
 * Rosas Sincronizadas, Té de los Opuestos).
 */
import { type StateVector, applyCNOT, applyGate1, zeroState } from "./statevector.js";
import { H, X } from "./gates.js";
import type { Rng } from "./math/rng.js";
import { measureAll } from "./statevector.js";

/** Los cuatro estados de Bell. */
export type BellKind = "phi+" | "phi-" | "psi+" | "psi-";

/** Construye un estado de Bell de 2 qubits (little-endian, q0 objetivo del CNOT). */
export function bellState(kind: BellKind = "phi+"): StateVector {
  let s = zeroState(2);
  // Preparaciones opcionales antes de crear el enredo.
  if (kind === "psi+" || kind === "psi-") s = applyGate1(s, 0, X); // voltea q0
  if (kind === "phi-" || kind === "psi-") s = applyGate1(s, 1, X); // introduce el signo relativo vía fase de q1
  s = applyGate1(s, 1, H);
  s = applyCNOT(s, 1, 0);
  return s;
}

/**
 * Correlación entre las mediciones de los dos qubits de un estado de Bell.
 * +1 = perfectamente correlacionados (|Φ⟩: 00/11), −1 = anticorrelados (|Ψ⟩: 01/10).
 */
export function correlation(kind: BellKind): 1 | -1 {
  return kind === "psi+" || kind === "psi-" ? -1 : 1;
}

/**
 * Mapea el input de un jugador al del jugador entrelazado.
 * `inverse=true` modela el acoplamiento anticorrelado de "Espejos Ciegos" (si Alicia sube, el Conejo
 * baja) o "El Té de los Opuestos" (izquierda ↔ derecha).
 */
export function coupledAxis(value: number, inverse: boolean): number {
  return inverse ? -value : value;
}

/** Aplica correlación a un booleano discreto (p.ej. saltar → agacharse en Tweedledum/Tweedledee). */
export function coupledAction(action: boolean, correlation: 1 | -1): boolean {
  return correlation === 1 ? action : !action;
}

/**
 * Mide un par de Bell y devuelve los dos bits correlacionados (para verificar en gameplay).
 */
export function measureBellPair(kind: BellKind, rng: Rng): { a: number; b: number } {
  const { bits } = measureAll(bellState(kind), rng);
  return { a: bits[0] as number, b: bits[1] as number };
}
