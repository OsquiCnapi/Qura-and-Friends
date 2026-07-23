// Validación anti-trampa DUPLICADA (mínima) en Deno.
//
// Las Edge Functions son Deno y NO pueden importar el paquete pnpm @quantum-party/game-core. Esta es la
// copia mínima y estable de la recomputación de energía QUBO y de los límites de score. Debe mantenerse
// coherente con packages/quantum-engine/src/annealing/qubo.ts y packages/game-core/src/scoring.

export interface QUBO {
  n: number;
  linear: number[];
  quadratic: [number, number, number][];
}

/** Energía QUBO determinista: E(x) = Σ linear_i·x_i + Σ quad_{ij}·x_i·x_j. */
export function quboEnergy(qubo: QUBO, x: number[]): number {
  let e = 0;
  for (let i = 0; i < qubo.n; i++) e += qubo.linear[i] * x[i];
  for (const [i, j, w] of qubo.quadratic) e += w * x[i] * x[j];
  return e;
}

/** Techo teórico de puntos por dificultad (coherente con game-core/scoring/score.ts). */
export function theoreticalMax(difficulty: number, maxAtDiff1 = 1000): number {
  return Math.round(maxAtDiff1 * (1 + 0.25 * (difficulty - 1))) + 300;
}

export interface Verdict {
  ok: boolean;
  reason?: string;
}

export function validateSubmission(
  score: number,
  difficulty: number,
  proof: { durationMs: number; qubo?: QUBO; assignment?: number[]; energy?: number },
): Verdict {
  if (score < 0) return { ok: false, reason: "score negativo" };
  if (score > theoreticalMax(difficulty)) return { ok: false, reason: "score sobre el máximo" };
  if (proof.durationMs < 1500) return { ok: false, reason: "duración demasiado corta" };
  if (proof.qubo && proof.assignment) {
    if (proof.assignment.length !== proof.qubo.n) {
      return { ok: false, reason: "asignación de longitud incorrecta" };
    }
    const recomputed = quboEnergy(proof.qubo, proof.assignment);
    if (proof.energy !== undefined && Math.abs(recomputed - proof.energy) > 1e-6) {
      return { ok: false, reason: "energía no coincide" };
    }
  }
  return { ok: true };
}
