/**
 * Compuertas de un qubit como matrices 2×2 (row-major `[u00, u01, u10, u11]`).
 *
 * Fuente pedagógica: `qbronze_docs/quantum-operators` (X, Z, H reales) y
 * `qsilver_docs/complex-gates-multiqubit` (fase S, T, P y rotaciones Rx/Ry/Rz).
 * En la esfera de Bloch (`packages/quantum-viz`) cada compuerta se anima como una rotación:
 * X/Y/Z = π sobre su eje; S = π/2, T = π/4 sobre z; H = Ry(π/2)∘Rx(π).
 */
import { type Complex, complex, expI, mul } from "./math/complex.js";

export type Gate2x2 = readonly [Complex, Complex, Complex, Complex];

const c = complex;
const INV_SQRT2 = 1 / Math.SQRT2;

/** Identidad. */
export const I2: Gate2x2 = [c(1), c(0), c(0), c(1)];

/** Pauli-X (NOT): intercambia |0⟩ ↔ |1⟩. */
export const X: Gate2x2 = [c(0), c(1), c(1), c(0)];

/** Pauli-Y. */
export const Y: Gate2x2 = [c(0), c(0, -1), c(0, 1), c(0)];

/** Pauli-Z: fase de π sobre |1⟩. */
export const Z: Gate2x2 = [c(1), c(0), c(0), c(-1)];

/** Hadamard: crea superposición equiprobable. H|0⟩ = |+⟩, H|1⟩ = |−⟩. */
export const H: Gate2x2 = [
  c(INV_SQRT2),
  c(INV_SQRT2),
  c(INV_SQRT2),
  c(-INV_SQRT2),
];

/** Compuerta de fase S = P(π/2) = √Z. */
export const S: Gate2x2 = [c(1), c(0), c(0), c(0, 1)];

/** Compuerta T = P(π/4). */
export const T: Gate2x2 = [c(1), c(0), c(0), expI(Math.PI / 4)];

/** Compuerta de fase genérica P(λ): aplica e^{iλ} a |1⟩. */
export const phase = (lambda: number): Gate2x2 => [c(1), c(0), c(0), expI(lambda)];

/** Rotación Rx(θ). */
export const rx = (theta: number): Gate2x2 => {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [c(cos), c(0, -sin), c(0, -sin), c(cos)];
};

/** Rotación Ry(θ). Preparar un qubit real en ángulo θ usa ry(2θ) (el "factor de 2" de los docs). */
export const ry = (theta: number): Gate2x2 => {
  const cos = Math.cos(theta / 2);
  const sin = Math.sin(theta / 2);
  return [c(cos), c(-sin), c(sin), c(cos)];
};

/** Rotación Rz(θ). */
export const rz = (theta: number): Gate2x2 => {
  const e = expI(theta / 2);
  return [complex(e.re, -e.im), c(0), c(0), e];
};

/** Multiplica dos matrices 2×2 (composición de compuertas: `after ∘ before`). */
export function compose(after: Gate2x2, before: Gate2x2): Gate2x2 {
  const [a00, a01, a10, a11] = after;
  const [b00, b01, b10, b11] = before;
  const add2 = (x: Complex, y: Complex): Complex => ({ re: x.re + y.re, im: x.im + y.im });
  return [
    add2(mul(a00, b00), mul(a01, b10)),
    add2(mul(a00, b01), mul(a01, b11)),
    add2(mul(a10, b00), mul(a11, b10)),
    add2(mul(a10, b01), mul(a11, b11)),
  ];
}

/** Compuerta escalada por una fase global (útil para tests de fase inobservable). */
export const globalPhase = (g: Gate2x2, theta: number): Gate2x2 => {
  const p = expI(theta);
  return [mul(g[0], p), mul(g[1], p), mul(g[2], p), mul(g[3], p)] as Gate2x2;
};
