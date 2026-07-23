/**
 * Vector de estado de `n` qubits: 2ⁿ amplitudes complejas.
 *
 * Convención **little-endian** (igual que Qiskit y los docs qbronze/qsilver): el bit menos
 * significativo del índice de base es el qubit 0. Es decir, el índice de base `b` codifica el valor
 * del qubit `q` en el bit `(b >> q) & 1`.
 */
import { type Complex, abs2, add, complex, mul, scale, ZERO } from "./math/complex.js";
import { type Rng, sampleFromDistribution } from "./math/rng.js";

export interface StateVector {
  readonly numQubits: number;
  readonly amplitudes: Complex[];
}

/** Estado base |00…0⟩. */
export function zeroState(numQubits: number): StateVector {
  const dim = 1 << numQubits;
  const amplitudes: Complex[] = new Array(dim).fill(ZERO);
  amplitudes[0] = complex(1, 0);
  return { numQubits, amplitudes };
}

/** Estado a partir de amplitudes crudas (se normaliza). */
export function fromAmplitudes(amplitudes: Complex[]): StateVector {
  const numQubits = Math.log2(amplitudes.length);
  if (!Number.isInteger(numQubits)) {
    throw new Error("fromAmplitudes: la longitud debe ser potencia de 2");
  }
  return normalize({ numQubits, amplitudes: [...amplitudes] });
}

/** Norma L2 al cuadrado ‖ψ‖². Debe ser 1 para un estado físico. */
export function norm2(state: StateVector): number {
  return state.amplitudes.reduce((s, a) => s + abs2(a), 0);
}

/** Renormaliza el estado a ‖ψ‖ = 1. */
export function normalize(state: StateVector): StateVector {
  const n = Math.sqrt(norm2(state));
  if (n === 0) throw new Error("normalize: estado nulo");
  return { ...state, amplitudes: state.amplitudes.map((a) => scale(a, 1 / n)) };
}

/** Distribución de probabilidad sobre los 2ⁿ resultados de medición (regla de Born). */
export function probabilities(state: StateVector): number[] {
  return state.amplitudes.map(abs2);
}

/** Probabilidad de medir el qubit `q` en |1⟩. */
export function probOne(state: StateVector, q: number): number {
  let p = 0;
  for (let b = 0; b < state.amplitudes.length; b++) {
    if ((b >> q) & 1) p += abs2(state.amplitudes[b] as Complex);
  }
  return p;
}

/**
 * Mide TODOS los qubits, colapsando el estado. Devuelve el resultado como entero (little-endian)
 * y el estado colapsado post-medición. Usa el `Rng` inyectado (determinista).
 */
export function measureAll(
  state: StateVector,
  rng: Rng,
): { outcome: number; bits: number[]; collapsed: StateVector } {
  const outcome = sampleFromDistribution(rng, probabilities(state));
  const collapsed = zeroState(state.numQubits);
  (collapsed.amplitudes as Complex[]).fill(ZERO);
  (collapsed.amplitudes as Complex[])[outcome] = complex(1, 0);
  const bits: number[] = [];
  for (let q = 0; q < state.numQubits; q++) bits.push((outcome >> q) & 1);
  return { outcome, bits, collapsed };
}

/**
 * Aplica una matriz unitaria 2×2 a un qubit objetivo `target`.
 * `u = [[u00, u01], [u10, u11]]`.
 */
export function applyGate1(
  state: StateVector,
  target: number,
  u: readonly [Complex, Complex, Complex, Complex],
): StateVector {
  const [u00, u01, u10, u11] = u;
  const out = [...state.amplitudes];
  const bit = 1 << target;
  for (let b = 0; b < out.length; b++) {
    if ((b & bit) === 0) {
      const b1 = b | bit;
      const a0 = state.amplitudes[b] as Complex;
      const a1 = state.amplitudes[b1] as Complex;
      out[b] = add(mul(u00, a0), mul(u01, a1));
      out[b1] = add(mul(u10, a0), mul(u11, a1));
    }
  }
  return { ...state, amplitudes: out };
}

/** Aplica un CNOT con qubit de control `control` y objetivo `target`. */
export function applyCNOT(state: StateVector, control: number, target: number): StateVector {
  const out = [...state.amplitudes];
  const cbit = 1 << control;
  const tbit = 1 << target;
  for (let b = 0; b < out.length; b++) {
    if ((b & cbit) !== 0 && (b & tbit) === 0) {
      const partner = b | tbit;
      const tmp = out[b] as Complex;
      out[b] = out[partner] as Complex;
      out[partner] = tmp;
    }
  }
  return { ...state, amplitudes: out };
}
