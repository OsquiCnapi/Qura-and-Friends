/**
 * Interferencia de ondas — base de la Categoría 3.
 *
 * Fuente: `qbronze_docs/quantum-operators` (interferencia constructiva/destructiva, H·H = I por
 * cancelación de signos) y `qsilver_docs/complex-gates-multiqubit` (fase relativa).
 * Se modela una onda como `A·sin(kx − ωt + φ)`; la suma de dos ondas produce interferencia que el
 * jugador debe leer (zonas seguras, cancelar ataques con fase inversa, alinear fases, etc.).
 */
export interface Wave {
  readonly amplitude: number;
  readonly wavelength: number; // λ
  readonly speed: number; // ω/k proporcional; aquí usamos ω directamente
  readonly phase: number; // φ en radianes
}

const TWO_PI = Math.PI * 2;

/** Valor de la onda en la posición `x` (mundo) y tiempo `t`. */
export function sample(wave: Wave, x: number, t: number): number {
  const k = TWO_PI / wave.wavelength;
  return wave.amplitude * Math.sin(k * x - wave.speed * t + wave.phase);
}

/** Superposición (suma) de varias ondas en `(x, t)`. */
export function superpose(waves: readonly Wave[], x: number, t: number): number {
  return waves.reduce((sum, w) => sum + sample(w, x, t), 0);
}

/**
 * ¿Dos ondas interfieren destructivamente en `(x, t)`? (suma ≈ 0 dentro de una tolerancia relativa).
 * Base de "El Canto de la Falsa Tortuga" (anular un ataque con fase inversa) y de las zonas seguras
 * de "La Fiesta del Té Destructiva".
 */
export function isDestructive(a: Wave, b: Wave, x: number, t: number, eps = 0.05): boolean {
  const total = Math.abs(sample(a, x, t) + sample(b, x, t));
  const scaleRef = a.amplitude + b.amplitude;
  return scaleRef === 0 ? true : total / scaleRef < eps;
}

/** ¿Interferencia constructiva? (suma ≈ suma de amplitudes máximas). */
export function isConstructive(
  waves: readonly Wave[],
  x: number,
  t: number,
  eps = 0.1,
): boolean {
  const total = Math.abs(superpose(waves, x, t));
  const maxSum = waves.reduce((s, w) => s + Math.abs(w.amplitude), 0);
  return maxSum === 0 ? false : total / maxSum > 1 - eps;
}

/**
 * Fase que cancela una onda dada (fase inversa): la que el jugador debe disparar para anular el ataque.
 * Devuelve la fase objetivo en [0, 2π).
 */
export function cancelingPhase(wave: Wave): number {
  return (wave.phase + Math.PI) % TWO_PI;
}

/** Diferencia angular mínima entre dos fases (para puntuar precisión), en [0, π]. */
export function phaseError(a: number, b: number): number {
  const d = Math.abs(((a - b) % TWO_PI) + TWO_PI) % TWO_PI;
  return Math.min(d, TWO_PI - d);
}
