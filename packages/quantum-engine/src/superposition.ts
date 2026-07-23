/**
 * Superposición y medición/colapso — base de la Categoría 1.
 *
 * Fuente: `qbronze_docs/{real-qubit-geometry, quantum-operators, qubit-tomography}`.
 * Modelo del qubit real: estado = flecha en el círculo unidad `[cosθ, sinθ]`; medir = "tirar un dardo"
 * que colapsa a |0⟩/|1⟩ con probabilidad `cos²θ` / `sin²θ`. Aquí se exponen helpers de gameplay
 * (barra de coherencia, muestreo probabilístico, colapso) sin acoplar a ningún framework.
 */
import { type Rng, sampleFromDistribution } from "./math/rng.js";

/** Estado de un qubit real por su ángulo θ (radianes, CCW desde |0⟩). */
export interface RealQubit {
  readonly theta: number;
}

/** Amplitudes reales `[x, y]` del ángulo. */
export const amplitudesFromAngle = (theta: number): [number, number] => [
  Math.cos(theta),
  Math.sin(theta),
];

/** Probabilidad de medir |0⟩ (regla de Born, `x²`). */
export const probZero = (theta: number): number => Math.cos(theta) ** 2;

/** Probabilidad de medir |1⟩ (`y²`). */
export const probOne = (theta: number): number => Math.sin(theta) ** 2;

/** Colapsa el qubit real: devuelve 0 o 1 según probabilidad, usando el `Rng` inyectado. */
export function collapse(qubit: RealQubit, rng: Rng): 0 | 1 {
  return rng.next() < probZero(qubit.theta) ? 0 : 1;
}

/**
 * Barra de coherencia: modela el "recurso" de superposición del jugador (p.ej. La Carrera del Gato).
 * Se drena mientras la superposición está activa; si llega a 0 el sistema "mide" y colapsa.
 */
export interface CoherenceBar {
  readonly value: number; // 0..1
  readonly max: number;
  readonly drainPerSecond: number;
  readonly regenPerSecond: number;
}

export const makeCoherenceBar = (
  drainPerSecond = 0.35,
  regenPerSecond = 0.15,
): CoherenceBar => ({ value: 1, max: 1, drainPerSecond, regenPerSecond });

/** Avanza la barra un paso de tiempo `dt` (segundos). `superposed`: si la superposición está activa. */
export function tickCoherence(bar: CoherenceBar, dt: number, superposed: boolean): CoherenceBar {
  const delta = superposed ? -bar.drainPerSecond * dt : bar.regenPerSecond * dt;
  const value = Math.max(0, Math.min(bar.max, bar.value + delta));
  return { ...bar, value };
}

export const isCollapsedByMeasurement = (bar: CoherenceBar): boolean => bar.value <= 0;

/**
 * Mapa de calor probabilístico (p.ej. "El Sombrerero Oculto"): dado un conjunto de celdas con pesos,
 * devuelve las probabilidades normalizadas para pintar el heatmap y muestrear el colapso.
 */
export function normalizeHeatmap(weights: readonly number[]): number[] {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) return weights.map(() => 0);
  return weights.map((w) => Math.max(0, w) / total);
}

export function sampleHeatmap(rng: Rng, weights: readonly number[]): number {
  return sampleFromDistribution(rng, weights);
}
