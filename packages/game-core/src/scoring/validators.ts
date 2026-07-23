/**
 * Validadores anti-trampa. Se ejecutan en el servidor (Edge Function `submit-score`), pero viven aquí
 * como lógica pura para poder testearlos y documentar la política. La Edge Function (Deno) duplica una
 * versión mínima en `supabase/functions/_shared/` porque no puede importar este paquete pnpm.
 */
import { energy, type QUBO } from "@quantum-party/quantum-engine/annealing";
import type { ScoreProof } from "@quantum-party/schemas";
import { theoreticalMax } from "./score.js";

export interface ValidationResult {
  readonly ok: boolean;
  readonly reason?: string;
}

/** El score no puede superar el máximo teórico de la dificultad, ni la duración ser implausible. */
export function validateScoreBounds(
  score: number,
  difficulty: number,
  proof: ScoreProof,
  minDurationMs = 1500,
  maxDurationMs = 5 * 60_000,
): ValidationResult {
  if (score < 0) return { ok: false, reason: "score negativo" };
  if (score > theoreticalMax(difficulty)) return { ok: false, reason: "score sobre el máximo teórico" };
  if (proof.durationMs < minDurationMs) return { ok: false, reason: "duración demasiado corta" };
  if (proof.durationMs > maxDurationMs) return { ok: false, reason: "duración implausible" };
  return { ok: true };
}

/**
 * Para minijuegos de annealing: recomputa la energía QUBO desde la asignación enviada y comprueba que
 * coincide con la reclamada. Determinista y barato — no necesita OpenJij.
 */
export function validateAnnealProof(proof: ScoreProof, tolerance = 1e-6): ValidationResult {
  if (!proof.qubo || !proof.assignment) {
    return { ok: false, reason: "falta qubo/assignment en el proof" };
  }
  const qubo: QUBO = {
    n: proof.qubo.n,
    linear: proof.qubo.linear,
    quadratic: proof.qubo.quadratic as ReadonlyArray<readonly [number, number, number]>,
  };
  if (proof.assignment.length !== qubo.n) {
    return { ok: false, reason: "longitud de asignación incorrecta" };
  }
  const recomputed = energy(qubo, proof.assignment);
  if (proof.energy !== undefined && Math.abs(recomputed - proof.energy) > tolerance) {
    return { ok: false, reason: "energía reclamada no coincide con la recomputada" };
  }
  return { ok: true };
}
