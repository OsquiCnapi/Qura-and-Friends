/**
 * Generador de números pseudoaleatorios **sembrado y determinista** (mulberry32).
 *
 * Regla del motor: NUNCA usar `Math.random()` internamente. Toda aleatoriedad se inyecta vía `Rng`
 * para que las partidas sean reproducibles (mismo seed ⇒ mismo resultado) y verificables en el
 * servidor (anti-trampa). También evita `Math.random`, prohibido en scripts de workflow.
 */
export interface Rng {
  /** Flotante en [0, 1). */
  next(): number;
  /** Entero en [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Booleano verdadero con probabilidad `p` (por defecto 0.5). */
  bool(p?: number): boolean;
  /** Elige un elemento del arreglo de forma uniforme. */
  pick<T>(items: readonly T[]): T;
  /** Semilla original (para incluir en el `proof` de resultados). */
  readonly seed: number;
}

export function createRng(seed: number): Rng {
  // Estado de 32 bits derivado del seed.
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    seed,
    next,
    int: (maxExclusive: number) => Math.floor(next() * maxExclusive),
    bool: (p = 0.5) => next() < p,
    pick: <T>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error("rng.pick: arreglo vacío");
      return items[Math.floor(next() * items.length)] as T;
    },
  };
}

/**
 * Muestrea un índice según una distribución de probabilidad discreta (no necesita estar normalizada).
 * Usado por la medición cuántica (colapso) y por los mapas de calor probabilísticos.
 */
export function sampleFromDistribution(rng: Rng, weights: readonly number[]): number {
  const total = weights.reduce((s, w) => s + Math.max(0, w), 0);
  if (total <= 0) throw new Error("sampleFromDistribution: pesos no positivos");
  let r = rng.next() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= Math.max(0, weights[i] as number);
    if (r <= 0) return i;
  }
  return weights.length - 1;
}
